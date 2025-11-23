import { test, expect } from "@playwright/test";

test.describe("Layout Validation", () => {
  test("State 1: Not Supported - Device too small (max dimension < 812px)", async ({
    page,
  }) => {
    // Set viewport to a device that's too small (both dimensions < 812px)
    await page.setViewportSize({ width: 600, height: 400 });
    await page.goto("/");

    // Should display "Device Not Supported" overlay
    await expect(page.getByText("Device Not Supported")).toBeVisible();

    // Portrait lock overlay should be covering the UI
    await expect(page.locator(".portrait-lock")).toBeVisible();
  });

  test("State 2: Rotate Required - Portrait orientation on capable device", async ({
    page,
  }) => {
    // Set viewport to portrait orientation with sufficient max dimension (>= 812px)
    await page.setViewportSize({ width: 400, height: 850 });
    await page.goto("/");

    // Should display "Rotate Your Device" overlay
    await expect(page.getByText("Rotate Your Device")).toBeVisible();

    // Portrait lock overlay should be covering the UI
    await expect(page.locator(".portrait-lock")).toBeVisible();
  });

  test("State 3: Compact Landscape - Phone layout (width <= 920px)", async ({
    page,
  }) => {
    // Set viewport to landscape phone size (e.g., iPhone X landscape: 812x375)
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto("/");

    // Should NOT show any overlay - game should be playable
    await expect(page.locator(".portrait-lock")).not.toBeVisible();

    // Game UI should be visible
    await expect(page.locator(".drop-button")).toBeVisible();

    // Critical: Verify title logo doesn't overlap with HUD elements
    const title = page.locator(".title-image");
    const hudLeft = page.locator(".hud-left");
    const hudRight = page.locator(".hud-right");

    await expect(title).toBeVisible();

    // Get bounding boxes to check for overlaps
    const titleBox = await title.boundingBox();
    const hudLeftBox = await hudLeft.boundingBox();
    const hudRightBox = await hudRight.boundingBox();

    if (titleBox && hudLeftBox) {
      // Title should not overlap with HUD left (recording/note group)
      const noLeftOverlap =
        titleBox.x >= hudLeftBox.x + hudLeftBox.width ||
        titleBox.x + titleBox.width <= hudLeftBox.x;
      expect(noLeftOverlap).toBe(true);
    }

    if (titleBox && hudRightBox) {
      // Title should not overlap with HUD right (score/progress group)
      const noRightOverlap =
        titleBox.x >= hudRightBox.x + hudRightBox.width ||
        titleBox.x + titleBox.width <= hudRightBox.x;
      expect(noRightOverlap).toBe(true);
    }

    // Test at upper bound of compact range (920px)
    await page.setViewportSize({ width: 920, height: 414 });
    await page.goto("/");

    await expect(page.locator(".drop-button")).toBeVisible();
    await expect(title).toBeVisible();
  });

  test("State 4: Standard Landscape - Desktop/Tablet layout (width > 920px)", async ({
    page,
  }) => {
    // Set viewport to desktop/tablet size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Should NOT show any overlay - game should be playable
    await expect(page.locator(".portrait-lock")).not.toBeVisible();

    // Game UI should be visible
    await expect(page.locator(".drop-button")).toBeVisible();

    // Title should be centered and visible
    const title = page.locator(".title-image");
    await expect(title).toBeVisible();

    // Verify no overlap between HUD elements
    const hudLeft = page.locator(".hud-left");
    const hudRight = page.locator(".hud-right");

    const titleBox = await title.boundingBox();
    const hudLeftBox = await hudLeft.boundingBox();
    const hudRightBox = await hudRight.boundingBox();

    if (titleBox && hudLeftBox) {
      const noLeftOverlap =
        titleBox.x >= hudLeftBox.x + hudLeftBox.width ||
        titleBox.x + titleBox.width <= hudLeftBox.x;
      expect(noLeftOverlap).toBe(true);
    }

    if (titleBox && hudRightBox) {
      const noRightOverlap =
        titleBox.x >= hudRightBox.x + hudRightBox.width ||
        titleBox.x + titleBox.width <= hudRightBox.x;
      expect(noRightOverlap).toBe(true);
    }

    // Verify the hud-center container (which holds the title) is properly sized
    const hudCenter = page.locator(".hud-center");
    await expect(hudCenter).toBeVisible();
  });

  test("Layout boundary: 812px height threshold", async ({ page }) => {
    // Test just below threshold (should show "Not Supported")
    await page.setViewportSize({ width: 600, height: 811 });
    await page.goto("/");
    await expect(page.getByText("Device Not Supported")).toBeVisible();

    // Test at threshold (should be playable)
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto("/");
    await expect(page.locator(".drop-button")).toBeVisible();
    await expect(page.locator(".portrait-lock")).not.toBeVisible();
  });

  test("Layout boundary: 920px width threshold for compact vs standard", async ({
    page,
  }) => {
    // Test at compact upper bound (920px - should be compact)
    await page.setViewportSize({ width: 920, height: 414 });
    await page.goto("/");

    const title = page.locator(".title-image");
    await expect(title).toBeVisible();
    await expect(page.locator(".portrait-lock")).not.toBeVisible();

    const hudCenter = page.locator(".hud-center");
    const compactStyles = await hudCenter.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        transform: styles.transform,
        marginTop: styles.marginTop,
      };
    });

    // Test just above threshold (921px - should be standard)
    await page.setViewportSize({ width: 921, height: 414 });
    await page.goto("/");

    await expect(title).toBeVisible();

    const standardStyles = await hudCenter.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        transform: styles.transform,
        marginTop: styles.marginTop,
      };
    });

    // Styles should be different between compact and standard
    const stylesDifferent =
      compactStyles.transform !== standardStyles.transform ||
      compactStyles.marginTop !== standardStyles.marginTop;
    expect(stylesDifferent).toBe(true);
  });
});
