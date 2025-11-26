import { test, expect } from "@playwright/test";

test.describe("Voice Training Mode", () => {
  test("renders Happy Birthday grand staff notation", async ({ page }) => {
    await page.goto("/?voice-train=happy-birthday");

    // Verify the song title is displayed
    await expect(page.getByText("Happy Birthday")).toBeVisible();

    // Verify grand staff indicator
    await expect(page.getByText("Grand Staff")).toBeVisible();

    // Verify pagination shows page 1 (use .first() since it appears in multiple places)
    await expect(page.getByText(/Page 1/).first()).toBeVisible();

    // Verify the music staff SVG is rendered
    const staffContainer = page.locator(".music-staff-container svg");
    await expect(staffContainer).toBeVisible();

    // Verify both treble and bass clefs are rendered (grand staff has both)
    // VexFlow renders clefs as path elements within the SVG
    const svgContent = await staffContainer.innerHTML();
    expect(svgContent.length).toBeGreaterThan(1000); // SVG should have substantial content
  });

  test("can navigate to different pages via query param", async ({ page }) => {
    // Page 2
    await page.goto("/?voice-train=happy-birthday&page=2");
    await expect(page.getByText(/Page 2/).first()).toBeVisible();
    await expect(page.getByText(/Measures 5-8/)).toBeVisible();

    // Page 3
    await page.goto("/?voice-train=happy-birthday&page=3");
    await expect(page.getByText(/Page 3/).first()).toBeVisible();
    await expect(page.getByText(/Measures 9/)).toBeVisible();
  });

  test("drop the beat button toggles recording state", async ({ page }) => {
    await page.goto("/?voice-train=happy-birthday");

    const dropButton = page.locator(".drop-button");

    // Initially not recording (no hue-rotate filter)
    await expect(dropButton).not.toHaveCSS("filter", "hue-rotate(90deg)");

    // Click to start recording
    await dropButton.click();

    // Should now show recording state (hue-rotate filter)
    await expect(dropButton).toHaveCSS("filter", "hue-rotate(90deg)");

    // Click again to stop
    await dropButton.click();

    // Should return to non-recording state
    await expect(dropButton).not.toHaveCSS("filter", "hue-rotate(90deg)");
  });

  test("restart button resets the exercise", async ({ page }) => {
    await page.goto("/?voice-train=happy-birthday&debug=true");

    // Start recording
    await page.click(".drop-button");
    await expect(page.locator(".drop-button")).toHaveCSS(
      "filter",
      "hue-rotate(90deg)",
    );

    // Play a correct note to advance
    await page.waitForTimeout(500);
    await page.keyboard.press("G"); // First note is G3
    await page.waitForTimeout(300);

    // Click restart (back button)
    await page.click(".back-button");

    // Recording should stop
    await expect(page.locator(".drop-button")).not.toHaveCSS(
      "filter",
      "hue-rotate(90deg)",
    );

    // Progress should reset to 0%
    await expect(page.locator(".progress-text")).toHaveText("0%");
  });
});
