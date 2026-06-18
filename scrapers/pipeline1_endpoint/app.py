"""
Pipeline 1 upload endpoint — Flask app served by gunicorn under pm2.

Accepts CSV uploads from the dashboard, parses per-source format,
maps to the canonical lead schema, and calls data_writer.write_leads()
which handles eligibility filtering and per-field merging.

Endpoints:
  GET  /health
      Returns 200 if the server is alive. No auth required.

  POST /pipeline1/upload?source=<source-id>
      Accepts a multipart-form-data CSV upload.
      Requires Authorization: Bearer <PIPELINE1_API_KEY>.
      Returns JSON summary with row counts and the git commit hash.

Supported sources (v1):
  - tax-default
Subsequent sources to be added:
  - adverse-possession
  - ghl
  - mls-matrix
  - pa-widow
  - pa-senior
  - pa-unknown-sale-date
"""
import csv
import io
import re
import sys
from pathlib import Path

from flask import Flask, jsonify, request

# Add the scrapers/ directory to sys.path so we can import the data_writer
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT / "scrapers"))

from lib import data_writer  # noqa: E402
from pipeline1_endpoint.auth import require_api_key  # noqa: E402

app = Flask(__name__)

# CORS: allow requests from the dashboard origin only.
# For v1 single-user, the dashboard is served from GitHub Pages.
ALLOWED_ORIGIN = "https://cornerstonehb.github.io"


@app.after_request
def add_cors_headers(response):
    """Add permissive CORS headers for the dashboard origin only."""
    origin = request.headers.get("Origin", "")
    if origin == ALLOWED_ORIGIN:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return response


@app.route("/pipeline1/upload", methods=["OPTIONS"])
def upload_preflight():
    """CORS preflight handler — must return 200 with CORS headers."""
    return ("", 204)


@app.route("/health", methods=["GET"])
def health():
    """Lightweight liveness check — no auth required."""
    return jsonify({"status": "ok", "service": "pipeline1-upload"})


@app.route("/pipeline1/upload", methods=["POST"])
@require_api_key
def upload():
    """
    Accept a CSV upload for a specific Pipeline 1 source.

    Query parameter:
      source: one of the supported source IDs (see module docstring)

    Form field:
      file: the CSV file (multipart/form-data)

    Returns JSON with row counts, leads counts, and the git commit hash.
    """
    source = request.args.get("source", "").strip().lower()
    if not source:
        return jsonify({
            "error": "missing_source",
            "detail": "Query parameter 'source' is required.",
        }), 400

    if source not in SOURCE_PARSERS:
        return jsonify({
            "error": "unknown_source",
            "detail": f"Source '{source}' is not supported. "
                      f"Supported: {sorted(SOURCE_PARSERS.keys())}",
        }), 400

    if "file" not in request.files:
        return jsonify({
            "error": "missing_file",
            "detail": "No file uploaded under form field 'file'.",
        }), 400

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({
            "error": "empty_filename",
            "detail": "Uploaded file has no filename.",
        }), 400

    try:
        raw_bytes = uploaded_file.read()
        text = raw_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as e:
        return jsonify({
            "error": "decode_failed",
            "detail": f"Could not decode file as UTF-8: {e}",
        }), 400

    parser = SOURCE_PARSERS[source]
    try:
        leads = list(parser(text))
    except Exception as e:
        return jsonify({
            "error": "parse_failed",
            "detail": f"Could not parse CSV for source '{source}': {e}",
        }), 400

    rows_parsed = len(leads)

    try:
        summary = data_writer.write_leads(leads)
    except Exception as e:
        return jsonify({
            "error": "write_failed",
            "detail": f"data_writer.write_leads() raised: {e}",
        }), 500

    try:
        data_writer.write_meta(
            scraper_name=f"pipeline1-upload:{source}",
            status="ok",
            summary=summary,
        )
    except Exception as e:
        print(f"WARNING: write_meta failed: {e}", file=sys.stderr)

    try:
        committed = data_writer.commit_and_push(
            f"pipeline1-upload: {source} - "
            f"added {summary['added']}, updated {summary['updated']}, "
            f"rejected {summary['rejected']}"
        )
    except Exception as e:
        return jsonify({
            "error": "git_failed",
            "detail": f"commit_and_push raised: {e}",
            "summary": summary,
        }), 500

    return jsonify({
        "source": source,
        "filename": uploaded_file.filename,
        "rowsParsed": rows_parsed,
        "leadsWritten": summary["total"],
        "leadsAdded": summary["added"],
        "leadsUpdated": summary["updated"],
        "leadsRejected": summary["rejected"],
        "committed": committed,
    })


# ---------------------------------------------------------------------------
# Estate detection — Python port of dashboard's detectEstateStatus()
# ---------------------------------------------------------------------------
# Mirrors dashboard/src/App.jsx lines 935-1024 exactly. Owner-name regexes
# detect EST OF / DECEASED markers, life estate (LE), and remainderman (REM)
# patterns. Multi-owner fields ("X & Y", "X AND Y") get split and analyzed
# per-owner so one deceased owner alongside a living co-owner is correctly
# tagged as "EST OF 2nd Owner".

ESTATE_REGEX = re.compile(
    r"\b(?:EST(?:ATE)?\s*OF|EST\.?\s*OF|EST\b|ESTATE\b|"
    r"DEC(?:EASED|D|'D)|\(DECD\))\b",
    re.IGNORECASE,
)
CO_REGEX = re.compile(
    r"\bC/O\s+([A-Z][A-Z\s\.\-']+?)(?:$|\s{2,}|,)",
    re.IGNORECASE,
)
LE_REGEX = re.compile(
    r"\b(?:LE|L/E|\(LE\)|LIFE\s*ESTATE)\b",
    re.IGNORECASE,
)
REM_REGEX = re.compile(
    r"\b(?:REM(?:AINDERMAN)?|\(REM\))\b",
    re.IGNORECASE,
)
OWNER_SPLIT_REGEX = re.compile(r"\s+(?:&|AND)\s+", re.IGNORECASE)


def _split_owners(owner_str: str):
    """
    Split a multi-owner field into individual owner names.

    'JOHN SMITH & MARY SMITH' -> ['JOHN SMITH', 'MARY SMITH']
    'X AND Y AND Z'           -> ['X', 'Y', 'Z']
    """
    if not owner_str:
        return []
    return [p.strip() for p in OWNER_SPLIT_REGEX.split(owner_str) if p.strip()]


def _clean_owner_name(raw: str) -> str:
    """Strip estate / LE / REM / parenthetical markers from a name."""
    cleaned = ESTATE_REGEX.sub("", raw)
    cleaned = LE_REGEX.sub("", cleaned)
    cleaned = REM_REGEX.sub("", cleaned)
    cleaned = re.sub(r"\(\s*\)", "", cleaned)
    return cleaned.strip()


def detect_estate_tag(owner_name: str) -> str:
    """
    Inspect the owner name and return one of:
      - "LE / REM"          life estate or remainderman on title
      - "EST OF 2nd Owner"  multi-owner field, one deceased, one living
      - "EST OF"            single or all owners marked estate
      - None                no estate markers

    Note: This is the upload-time variant. It does NOT consider sale date
    (so it can't produce "Possible EST OF"). The dashboard's full
    detectEstateStatus also handles long-hold heuristic when sale data is
    present — Tax Default CSV doesn't include sale date so we skip that
    branch.
    """
    if not owner_name:
        return None

    owners = _split_owners(owner_name)
    if not owners:
        return None

    owner_analysis = [
        {
            "raw": o,
            "is_estate": bool(ESTATE_REGEX.search(o)),
            "is_le": bool(LE_REGEX.search(o)),
            "is_rem": bool(REM_REGEX.search(o)),
        }
        for o in owners
    ]

    has_le = any(o["is_le"] for o in owner_analysis)
    has_rem = any(o["is_rem"] for o in owner_analysis)
    estate_owners = [o for o in owner_analysis if o["is_estate"]]
    living_owners = [o for o in owner_analysis if not o["is_estate"] and not o["is_le"]]

    # 1. LE / REM
    if has_le or has_rem:
        return "LE / REM"

    # 2. EST OF 2nd Owner
    if len(owners) >= 2 and len(estate_owners) >= 1 and len(living_owners) >= 1:
        return "EST OF 2nd Owner"

    # 3. EST OF
    if len(estate_owners) > 0:
        return "EST OF"

    return None


# ---------------------------------------------------------------------------
# Amount parsing
# ---------------------------------------------------------------------------

def _parse_money(value: str) -> int:
    """
    Convert a money string like '$8,058 ' or '$17,189.50' to an integer
    (rounded). Returns 0 if the input is empty / unparseable.

    Tax Default CSV uses no decimal places (whole dollars), so int rounding
    is safe. Trailing whitespace and currency symbols are stripped.
    """
    if not value:
        return 0
    cleaned = value.strip().replace("$", "").replace(",", "").strip()
    if not cleaned:
        return 0
    try:
        return int(round(float(cleaned)))
    except (ValueError, TypeError):
        return 0


# ---------------------------------------------------------------------------
# Per-source CSV parsers
# ---------------------------------------------------------------------------

def _truthy_yes(value: str) -> bool:
    """Return True if a CSV cell is the YES sentinel (case-insensitive)."""
    return (value or "").strip().upper() == "YES"


def parse_tax_default(text: str):
    """
    Parse the Miami-Dade Tax Collector's Tax Default CSV (cleaned variant).

    The cleaned variant differs from the raw Tax Collector export:
    extra columns from Ellie's pre-upload cleaning pipeline (split first/last
    name, USPS vacancy flag, GHL/XLeads enrichment status).

    Expected columns (30 total):
      APN - Folio, Owner Name or Business Name, First Name, Last Name,
      Street Address, SMS Address, City, State, Postal Code,
      Property county, Tax Yrs Owed, Vacant, Use Code, Use Code Category,
      Total Tax, Account Status, Cert Status, Deed Status, Tax Default Owed,
      Owner Address Line 1, Owner Address Line 2, Owner Address City,
      Owner Address State, Owner Address ZIP, Folio Prefix, In XLeads,
      XLeads Status, XLeads Contact Id, XLeads Name, Match Method

    Yields lead dicts matching the field names the dashboard reads:
      - owner            (string)  — full owner-name string
      - amount           (number)  — Tax Default Owed parsed to int dollars
      - inCrm            (boolean) — True if "In XLeads" column was YES
      - estateTag        (string)  — "EST OF" | "EST OF 2nd Owner" |
                                     "LE / REM" | absent
      - flags            (array)   — ["vacant"] if Vacant=YES; otherwise []
      - listTypes        (array)   — [{ name: "Tax Default", source: ... }]
      - plus enriched per-property and per-owner fields.

    Skipped CSV columns: SMS Address (GHL-only), Property county
    (always Miami-Dade), Use Code / Use Code Category, Folio Prefix.
    """
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        folio = (row.get("APN - Folio") or "").strip()
        if not folio:
            continue

        owner_str = (row.get("Owner Name or Business Name") or "").strip()

        # Mailing address — concatenated, skipping blanks.
        mailing_parts = [
            (row.get("Owner Address Line 1") or "").strip(),
            (row.get("Owner Address Line 2") or "").strip(),
            (row.get("Owner Address City") or "").strip(),
            (row.get("Owner Address State") or "").strip(),
            (row.get("Owner Address ZIP") or "").strip(),
        ]
        mailing_parts = [p for p in mailing_parts if p]

        # Flags array — currently just vacancy (in_ghl moved to inCrm field)
        flags = []
        if _truthy_yes(row.get("Vacant", "")):
            flags.append("vacant")

        lead = {
            "folio": folio,
            # Dashboard-canonical owner/amount/CRM fields (line 760, 5795, 3516)
            "owner": owner_str,
            "amount": _parse_money(row.get("Tax Default Owed", "")),
            "inCrm": _truthy_yes(row.get("In XLeads", "")),
            # Owner-name parsed parts (no conflict with dashboard fields)
            "ownerFirstName": (row.get("First Name") or "").strip(),
            "ownerLastName": (row.get("Last Name") or "").strip(),
            # Property location
            "propertyAddress": (row.get("Street Address") or "").strip(),
            "propertyCity": (row.get("City") or "").strip(),
            "propertyState": (row.get("State") or "").strip(),
            "propertyZip": (row.get("Postal Code") or "").strip(),
            # Mailing address
            "mailingAddress": ", ".join(mailing_parts),
            # Tax & financial
            "taxYearsOwed": (row.get("Tax Yrs Owed") or "").strip(),
            "totalTax": (row.get("Total Tax") or "").strip(),
            "accountStatus": (row.get("Account Status") or "").strip(),
            "certStatus": (row.get("Cert Status") or "").strip(),
            "deedStatus": (row.get("Deed Status") or "").strip(),
            # GHL / XLeads enrichment (also reachable via inCrm boolean)
            "ghlStatus": (row.get("XLeads Status") or "").strip(),
            "ghlContactId": (row.get("XLeads Contact Id") or "").strip(),
            "ghlName": (row.get("XLeads Name") or "").strip(),
            "ghlMatchMethod": (row.get("Match Method") or "").strip(),
            # Provenance
            "listTypes": [
                {
                    "name": "Tax Default",
                    "source": "tax-collector-csv-cleaned",
                }
            ],
            "flags": flags,
        }

        # Estate detection: set estateTag if owner name shows estate markers.
        # Only set the field if a tag is detected — absent field is fine.
        estate_tag = detect_estate_tag(owner_str)
        if estate_tag:
            lead["estateTag"] = estate_tag

        yield lead


# Dispatcher: source-id -> parser function.
SOURCE_PARSERS = {
    "tax-default": parse_tax_default,
}


if __name__ == "__main__":
    # Development server only - production uses gunicorn under pm2.
    # Bound to localhost so dev-mode testing doesn't expose the port.
    app.run(host="127.0.0.1", port=5000, debug=True)
