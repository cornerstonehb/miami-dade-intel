"""
Data writer — manages docs/data.json that GitHub Pages serves.

Each scraper run:
  1. load existing leads from docs/data.json
  2. upsert new/updated leads (matched by folio)
  3. write data.json back
  4. write meta.json with run timestamp + status
  5. commit and push to GitHub → GitHub Pages rebuilds ~60s later
"""

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_FILE = REPO_ROOT / "docs" / "data.json"
META_FILE = REPO_ROOT / "docs" / "meta.json"


def load_leads() -> dict:
    """Load the current data.json (or return empty structure)."""
    if not DATA_FILE.exists():
        return {"leads": []}
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_leads(new_leads: Iterable[dict]) -> int:
    """
    Upsert new_leads into data.json by folio.
    Returns total lead count after upsert.
    """
    current = load_leads()
    by_folio = {l["folio"]: l for l in current["leads"] if "folio" in l}
    for lead in new_leads:
        folio = lead.get("folio")
        if not folio:
            continue
        existing = by_folio.get(folio, {})
        by_folio[folio] = {**existing, **lead}
    updated = {"leads": list(by_folio.values())}
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(updated, f, indent=2, ensure_ascii=False)
    return len(updated["leads"])


def write_meta(scraper_name: str, status: str, leads_count: int,
               error_message: Optional[str] = None) -> None:
    """Write scraper-run metadata to meta.json."""
    meta = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "lastScraper": scraper_name,
        "status": status,
        "leadsCount": leads_count,
        "errorMessage": error_message,
    }
    with META_FILE.open("w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)


def commit_and_push(message: str) -> bool:
    """
    Commit data.json + meta.json and push to origin/main.
    Returns True if commit was made, False if no changes.
    """
    try:
        subprocess.run(["git", "add", "docs/data.json", "docs/meta.json"],
                       cwd=REPO_ROOT, check=True)
        result = subprocess.run(["git", "status", "--porcelain"],
                                cwd=REPO_ROOT, capture_output=True, text=True, check=True)
        if not result.stdout.strip():
            print("No changes to commit")
            return False
        subprocess.run(["git", "commit", "-m", message], cwd=REPO_ROOT, check=True)
        subprocess.run(["git", "push", "origin", "main"], cwd=REPO_ROOT, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")
        raise
