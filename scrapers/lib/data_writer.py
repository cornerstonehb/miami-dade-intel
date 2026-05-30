"""
Data writer — manages docs/data.json that GitHub Pages serves.

The contract:
  Each scraper run upserts new/updated leads into docs/data.json,
  then commits and pushes the file. GitHub Pages rebuilds ~60s later.

Eligibility filters (applied at scrape time):
  - Jurisdiction: folio prefix must appear in FOLIO_PREFIX_TO_MUNICIPALITY
  - Condo: property address must NOT have content after a street-type word

Upsert semantics (per v5 archive Sections 2.4 and 2.19):
  Leads are keyed by folio. When the same folio appears in subsequent runs,
  the existing record is updated per-field with the merge strategy below:
    - Simple scalars                 -> new value overwrites old
    - listTypes array                -> replace pattern (Section 2.4)
    - previousListTypes array        -> append-only history of removed Lists
    - auctionStatusHistory array     -> append-only (Section 2.19)
    - flags array                    -> union (new flags add to existing)

Every record always has flags = [] at minimum (memory rule — missing flags
field crashes the dashboard with TypeError on .includes()).
"""
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_FILE = REPO_ROOT / "docs" / "data.json"
META_FILE = REPO_ROOT / "docs" / "meta.json"

# ---------------------------------------------------------------------------
# Eligibility filter tables and helpers
# ---------------------------------------------------------------------------

# Authoritative jurisdiction table — folio prefix -> municipality name.
# Mirrors the FOLIO_PREFIX_TO_MUNICIPALITY constant in dashboard/src/App.jsx
# (around line 2658). When this list changes, update both copies.
#
# Per v5 archive Section 1.11, this is the include list for all data
# sources. Any lead whose folio prefix is NOT a key here gets rejected
# at scrape time.
FOLIO_PREFIX_TO_MUNICIPALITY = {
    "01": "Miami",
    "03": "Coral Gables",
    "04": "Hialeah",
    "05": "Miami Springs",
    "06": "North Miami",
    "07": "North Miami Beach",
    "08": "Opa-Locka",
    "09": "South Miami",
    "10": "Homestead",
    "11": "Miami Shores",
    "15": "West Miami",
    "16": "Florida City",
    "17": "Biscayne Park",
    "18": "El Portal",
    "22": "Medley",
    "25": "Sweetwater",
    "26": "Virginia Gardens",
    "27": "Hialeah Gardens",
    "30": "Miami",
    "32": "Miami Lakes",
    "33": "Palmetto Bay",
    "34": "Miami Gardens",
    "36": "Cutler Bay",
}


def folio_prefix(folio: str) -> str:
    """
    Return the first 2 characters of the folio as the jurisdiction prefix.

    Folios may arrive in various formats (with or without dashes), so we
    strip non-digits first, then take the first 2 digits.
    """
    digits = re.sub(r"\D", "", folio or "")
    return digits[:2]


def is_in_jurisdiction(folio: str) -> bool:
    """Return True if the lead's folio is in an included jurisdiction."""
    return folio_prefix(folio) in FOLIO_PREFIX_TO_MUNICIPALITY

# Recognized street-type words from v5 archive Section 1.11.
# A property address ending at one of these words = SFR (keep).
# A property address with content AFTER one of these words = condo (reject).
STREET_TYPES = {
    "BLVD", "AVE", "ST", "RD", "DR", "LN", "WAY", "PL",
    "CT", "TER", "HWY", "CIR", "TRL", "PKWY", "LOOP", "ALY", "PATH",
}


def is_condo(property_address: str) -> bool:
    """
    Return True if the property address indicates a condo unit.

    Rule (per v5 archive Section 1.11): if the address has ANY content
    after a recognized street-type word, it's a condo unit. SFR addresses
    end at the street-type word.

    Examples:
      "9419 FONTAINEBLEAU BLVD"     -> SFR (BLVD is the last token)
      "765 CRANDON BLVD 409"        -> condo ("409" after BLVD)
      "6560 NW 114 AVE 531"         -> condo ("531" after AVE)
      "555 NE 15 ST 20-E"           -> condo ("20-E" after ST)

    The check uses the FIRST line of a multi-line address only — city,
    state, and zip live on subsequent lines and should be ignored here.
    """
    if not property_address:
        return False

    # Take only the street line (first line of the address)
    street_line = property_address.split("\n")[0].strip().upper()
    tokens = street_line.split()

    # Find the LAST street-type token in the line. Some addresses have
    # multiple street-type words (e.g., "MAIN AVENUE ST"), so we want the
    # last one as the canonical street-type marker.
    last_street_type_index = -1
    for i, token in enumerate(tokens):
        if token in STREET_TYPES:
            last_street_type_index = i

    if last_street_type_index == -1:
        # No recognized street type found — can't apply the rule confidently,
        # so don't filter (treat as SFR and let through). The jurisdiction
        # filter remains as the primary safety floor.
        return False

    # If the street-type token is the LAST token, it's an SFR.
    # If there's anything after it, it's a condo unit.
    return last_street_type_index < len(tokens) - 1

def is_eligible(lead: dict) -> bool:
    """
    Return True if the lead passes both eligibility filters.

    Combines jurisdiction + condo filters per v5 archive Section 1.11.
    Both filters must pass — a lead failing either is rejected.

    Used by write_leads() to filter incoming records before merging
    into data.json. Scrapers can also call this directly to short-circuit
    work on leads that won't be kept.
    """
    folio = lead.get("folio", "")
    if not is_in_jurisdiction(folio):
        return False

    property_address = lead.get("propertyAddress", "")
    if is_condo(property_address):
        return False

    return True

# ---------------------------------------------------------------------------
# Read / write / commit operations
# ---------------------------------------------------------------------------


def load_leads() -> dict:
    """
    Load the current docs/data.json file.

    Returns a dict with a "leads" key. If the file doesn't exist yet
    (first scraper run on a clean repo), returns an empty structure.
    """
    if not DATA_FILE.exists():
        return {"leads": []}
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)

def _merge_lead(existing: dict, incoming: dict) -> dict:
    """
    Merge an incoming scraped lead record into an existing dashboard lead.

    Per-field merge strategies per v5 archive Sections 2.4 and 2.19:

    | Field type             | Merge strategy                              |
    |------------------------|---------------------------------------------|
    | listTypes              | replace pattern (Section 2.4)               |
    | previousListTypes      | append-only history of removed Lists        |
    | auctionStatusHistory   | append-only (Section 2.19)                  |
    | flags                  | union (Section 2.19, plus memory rule)      |
    | All other scalars      | new value overwrites old                    |

    Returns a new dict — does not mutate either input.

    The replace pattern (Section 2.4):
      When listTypes changes between runs (e.g., "Pre-Foreclosure" is
      removed because the lead progressed to "PFC Auction"), the removed
      list names get appended to previousListTypes so the lifecycle
      history is preserved.

    auctionStatusHistory append-only:
      Each entry is {status, observedAt}. The merge dedupes on (status,
      observedAt) — re-scraping the same day with the same status does
      not append duplicate entries.
    """
    # Start with a shallow merge: all scalar fields take incoming values.
    # Then we override the array fields below with their proper strategies.
    merged = {**existing, **incoming}

    # --- listTypes + previousListTypes (replace pattern) -----------------
    existing_lists = existing.get("listTypes") or []
    incoming_lists = incoming.get("listTypes") or []

    if incoming_lists:
        # Find list names present in existing but missing from incoming —
        # these are the ones being "removed" by this scraper run.
        incoming_names = {lt.get("name") for lt in incoming_lists if lt.get("name")}
        existing_names = {lt.get("name") for lt in existing_lists if lt.get("name")}
        removed_names = existing_names - incoming_names

        # Build the new previousListTypes by appending removed names to the
        # existing history. Use a set + list to preserve order while dedup'ing.
        existing_prev = existing.get("previousListTypes") or []
        seen = set(existing_prev)
        new_prev = list(existing_prev)
        for name in removed_names:
            if name not in seen:
                new_prev.append(name)
                seen.add(name)

        merged["listTypes"] = incoming_lists
        merged["previousListTypes"] = new_prev
    else:
        # Incoming has no listTypes — preserve existing as-is.
        merged["listTypes"] = existing_lists
        merged["previousListTypes"] = existing.get("previousListTypes") or []

    # --- auctionStatusHistory (append-only, deduped by (status, date)) ---
    existing_history = existing.get("auctionStatusHistory") or []
    incoming_history = incoming.get("auctionStatusHistory") or []

    history_keys = {
        (entry.get("status"), entry.get("observedAt"))
        for entry in existing_history
    }
    merged_history = list(existing_history)
    for entry in incoming_history:
        key = (entry.get("status"), entry.get("observedAt"))
        if key not in history_keys:
            merged_history.append(entry)
            history_keys.add(key)
    merged["auctionStatusHistory"] = merged_history

    # --- flags (union, always at least []) -------------------------------
    existing_flags = existing.get("flags") or []
    incoming_flags = incoming.get("flags") or []
    seen_flags = set()
    merged_flags = []
    for flag in list(existing_flags) + list(incoming_flags):
        if flag not in seen_flags:
            merged_flags.append(flag)
            seen_flags.add(flag)
    merged["flags"] = merged_flags

    return merged

def write_leads(new_leads: Iterable[dict]) -> dict:
    """
    Upsert new leads into docs/data.json.

    For each incoming lead:
      1. Apply eligibility filters (jurisdiction + condo). Skip if rejected.
      2. Ensure flags field exists (default to [] per memory rule).
      3. If a lead with the same folio already exists, merge per
         _merge_lead() strategy. Otherwise create a new record.
      4. Write the updated leads list back to docs/data.json.

    Returns a summary dict with counts:
      {
        "total":    int,  # total leads in data.json after upsert
        "added":    int,  # new leads created
        "updated":  int,  # existing leads modified
        "rejected": int,  # leads filtered out by eligibility
      }
    """
    current = load_leads()
    by_folio = {l["folio"]: l for l in current["leads"] if "folio" in l}

    added = 0
    updated = 0
    rejected = 0

    for lead in new_leads:
        folio = lead.get("folio")
        if not folio:
            rejected += 1
            continue

        if not is_eligible(lead):
            rejected += 1
            continue

        # Memory rule: every record must have a flags array.
        if "flags" not in lead:
            lead["flags"] = []

        if folio in by_folio:
            by_folio[folio] = _merge_lead(by_folio[folio], lead)
            updated += 1
        else:
            by_folio[folio] = lead
            added += 1

    updated_data = {"leads": list(by_folio.values())}
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)

    return {
        "total": len(updated_data["leads"]),
        "added": added,
        "updated": updated,
        "rejected": rejected,
    }

def write_meta(
    scraper_name: str,
    status: str,
    summary: Optional[dict] = None,
    error_message: Optional[str] = None,
) -> None:
    """
    Write scraper-run metadata to docs/meta.json.

    The metadata captures the result of the most recent scraper run.
    The dashboard reads this file to display freshness indicators
    ("Last updated: 7 minutes ago") and to detect stale data.

    summary: the dict returned by write_leads() — contains total, added,
    updated, and rejected counts. If None, treated as zero counts.
    """
    if summary is None:
        summary = {"total": 0, "added": 0, "updated": 0, "rejected": 0}

    meta = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "lastScraper": scraper_name,
        "status": status,
        "leadsCount": summary.get("total", 0),
        "leadsAdded": summary.get("added", 0),
        "leadsUpdated": summary.get("updated", 0),
        "leadsRejected": summary.get("rejected", 0),
        "errorMessage": error_message,
    }
    with META_FILE.open("w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

def commit_and_push(message: str) -> bool:
    """
    Commit docs/data.json and docs/meta.json and push to origin/main.

    Returns True if a commit was made, False if there were no changes.
    Raises subprocess.CalledProcessError if any git operation fails
    (other than no-changes — that's a non-failure path).

    GitHub Pages will rebuild the live dashboard ~60 seconds after push.
    """
    try:
        subprocess.run(
            ["git", "add", "docs/data.json", "docs/meta.json"],
            cwd=REPO_ROOT,
            check=True,
        )

        result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )

        if not result.stdout.strip():
            print("No changes to commit")
            return False

        subprocess.run(
            ["git", "commit", "-m", message],
            cwd=REPO_ROOT,
            check=True,
        )

        subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=REPO_ROOT,
            check=True,
        )

        return True

    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")
        raise            