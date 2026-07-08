from playwright.sync_api import sync_playwright
import time

def capture_tab(url, filename):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1400, "height": 2000})
        page.goto(url)
        time.sleep(2)  # Wait for content to load
        page.screenshot(path=filename, full_page=True)
        browser.close()
        print(f"✅ Saved {filename}")

# Capture each tab
base = "http://localhost:5173"

print("Make sure Flicky is running (bun run dev) before running this script.")
print("Capturing tabs...")

capture_tab(f"{base}/panel.html", "~/flicky-home.png")
print("Now click on Chats tab in Flicky, then press Enter here...")
input()

capture_tab(f"{base}/panel.html", "~/flicky-chats.png")
print("Now click on Mind tab...")
input()

capture_tab(f"{base}/panel.html", "~/flicky-mind.png")
print("Now click on Voice tab...")
input()

capture_tab(f"{base}/panel.html", "~/flicky-voice.png")
print("Now click on General tab...")
input()

capture_tab(f"{base}/panel.html", "~/flicky-general.png")
print("Done! All screenshots saved to ~/")
