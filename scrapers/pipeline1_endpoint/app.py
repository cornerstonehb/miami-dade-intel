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

    # Read the file into memory. For 1-2MB files this is fine.
    try:
        raw_bytes = uploaded_file.read()
        text = raw_bytes.decode("utf-8-sig")  # handles BOM if present
    except UnicodeDecodeError as e:
        return jsonify({
            "error": "decode_failed",
            "detail": f"Could not decode file as UTF-8: {e}",
        }), 400

    # Parse the CSV using the source-specific parser.
    parser = SOURCE_PARSERS[source]
    try:
        leads = list(parser(text))
    except Exception as e:
        return jsonify({
            "error": "parse_failed",
            "detail": f"Could not parse CSV for source '{source}': {e}",
        }), 400

    rows_parsed = len(leads)

    # Write to docs/data.json via the data_writer.
    # The data_writer applies eligibility filters (jurisdiction + condo)
    # and the per-field merge strategies.
    try:
        summary = data_writer.write_leads(leads)
    except Exception as e:
        return jsonify({
            "error": "write_failed",
            "detail": f"data_writer.write_leads() raised: {e}",
        }), 500

    # Write meta.json so the dashboard knows when this ran.
    try:
        data_writer.write_meta(
            scraper_name=f"pipeline1-upload:{source}",
            status="ok",
            summary=summary,
        )
    except Exception as e:
        # Meta write failure is not fatal - the leads got written.
        # Log and continue.
        print(f"WARNING: write_meta failed: {e}", file=sys.stderr)

    # Commit and push the updated data.json + meta.json.
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
# Per-source CSV parsers
# ---------------------------------------------------------------------------

def _truthy_yes(value: str) -> bool:
    """Return True if a CSV cell is the YES sentinel."""
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

    Yields lead dicts with listTypes = [{"name": "Tax Default", ...}] and
    flags initialized as ["vacant"] and/or ["in_ghl"] when the respective
    columns are YES. Skipped columns: SMS Address (GHL-only), Property
    county (always Miami-Dade), Use Code / Use Code Category, Folio Prefix
    (derivable from folio).
    """
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        folio = (row.get("APN - Folio") or "").strip()
        if not folio:
            # Minimum validation: folio must be present.
            # The data_writer's eligibility filter will catch invalid prefixes.
            continue

        # Concatenate owner address into a single mailingAddress string,
        # skipping blank lines.
        mailing_parts = [
            (row.get("Owner Address Line 1") or "").strip(),
            (row.get("Owner Address Line 2") or "").strip(),
            (row.get("Owner Address City") or "").strip(),
            (row.get("Owner Address State") or "").strip(),
            (row.get("Owner Address ZIP") or "").strip(),
        ]
        mailing_parts = [p for p in mailing_parts if p]

        # Build the initial flags array from YES/NO indicators.
        flags = []
        if _truthy_yes(row.get("Vacant", "")):
            flags.append("vacant")
        if _truthy_yes(row.get("In XLeads", "")):
            flags.append("in_ghl")

        lead = {
            "folio": folio,
            # Owner identity
            "ownerName": (row.get("Owner Name or Business Name") or "").strip(),
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
            "taxDefaultOwed": (row.get("Tax Default Owed") or "").strip(),
            "accountStatus": (row.get("Account Status") or "").strip(),
            "certStatus": (row.get("Cert Status") or "").strip(),
            "deedStatus": (row.get("Deed Status") or "").strip(),
            # GHL / XLeads enrichment
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
        yield lead


# Dispatcher: source-id -> parser function.
# Add new sources here as their parsers are implemented.
SOURCE_PARSERS = {
    "tax-default": parse_tax_default,
}


if __name__ == "__main__":
    # Development server only - production uses gunicorn under pm2.
    # Bound to localhost so dev-mode testing doesn't expose the port.
    app.run(host="127.0.0.1", port=5000, debug=True)
