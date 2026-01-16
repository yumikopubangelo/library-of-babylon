
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_frontend(page: Page):
    # 1. Verify Home Page
    print("Navigating to Home Page...")
    page.goto("http://localhost:3000")

    # Use exact match for the H1 or get by role
    expect(page.get_by_role("heading", name="LIBRARY OF BABYLON").first).to_be_visible()

    # Take screenshot of Home Page
    page.screenshot(path="/home/jules/verification/home_page.png", full_page=True)
    print("Home Page Screenshot Taken.")

    # 2. Verify Creators Page
    print("Navigating to Creators Page...")
    # There is a link "View All Creators →"
    page.click("a[href='/creators']")

    expect(page.get_by_role("heading", name="The Archives")).to_be_visible()

    # Check for creator card existence
    expect(page.get_by_text("Hoshimachi Suisei").first).to_be_visible()

    # Take screenshot of Creators Page
    page.screenshot(path="/home/jules/verification/creators_page.png", full_page=True)
    print("Creators Page Screenshot Taken.")

    # 3. Verify Creator Detail Page
    print("Navigating to Creator Detail Page...")
    # Click on the first creator card
    page.click("text=Hoshimachi Suisei")

    # Wait for heading
    expect(page.get_by_role("heading", name="Hoshimachi Suisei")).to_be_visible()
    # Use first() or get_by_role to avoid ambiguity
    expect(page.get_by_role("heading", name="Archived Works").first).to_be_visible()

    # Take screenshot of Creator Detail Page
    page.screenshot(path="/home/jules/verification/creator_detail_page.png", full_page=True)
    print("Creator Detail Page Screenshot Taken.")

    # 4. Verify Search Page
    print("Navigating to Search Page...")
    page.goto("http://localhost:3000/search")
    expect(page.get_by_role("heading", name="Search Archive")).to_be_visible()

    # Take screenshot of Search Page
    page.screenshot(path="/home/jules/verification/search_page.png", full_page=True)
    print("Search Page Screenshot Taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Increase viewport size to capture more detail
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            time.sleep(2)
            verify_frontend(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
