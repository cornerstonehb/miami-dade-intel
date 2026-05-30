"""
Template scraper — copy when starting a new scraper.

Usage: python3 scrapers/jobs/your_scraper.py
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from lib.data_writer import write_leads, write_meta, commit_and_push

SCRAPER_NAME = "template"


def run():
    count = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # === Your scraping logic here ===
            # new_leads = []
            # page.goto("https://example.com")
            # ... extract rows, append to new_leads as dicts with 'folio' key ...
            # count = write_leads(new_leads)

            browser.close()

        write_meta(SCRAPER_NAME, "success", count)
        commit_and_push(f"{SCRAPER_NAME}: refreshed {count} leads")

    except Exception as e:
        error = str(e)
        write_meta(SCRAPER_NAME, "failed", 0, error)
        commit_and_push(f"{SCRAPER_NAME}: FAILED — {error}")
        raise


if __name__ == "__main__":
    run()
