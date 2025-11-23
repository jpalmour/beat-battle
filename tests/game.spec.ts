import { test, expect } from "@playwright/test";

test("Game Loop", async ({ page }) => {
  // 1. Load app with debug mode
  await page.goto("/?debug=true");

  // 2. Click "drop the beat"
  await page.click(".drop-button");

  // 3. Handle mic access
  // Playwright grants permissions via config, so we expect no prompt or auto-acceptance.
  // We verify that the recording light is on or the app is in recording state.
  // The "drop-button" filter changes when recording.
  await expect(page.locator(".drop-button")).toHaveCSS(
    "filter",
    "hue-rotate(90deg)",
  );

  // Wait for game to be ready
  await page.waitForTimeout(1000);

  // 4. Complete the exercise
  // Loop until we see progress or a limit
  for (let i = 0; i < 30; i++) {
    // Check for level up
    if (await page.locator(".level-up-text").isVisible()) {
      break;
    }

    // Read target note
    const targetText = await page.getByText(/TARGET:/).textContent();

    if (targetText) {
      const targetKey = await targetText.split("TARGET: ")[1]?.trim();
      if (targetKey && targetKey !== "END") {
        const noteName = targetKey.charAt(0);
        await page.keyboard.press(noteName);
        await page.waitForTimeout(200); // Wait for engine
      }
    }
  }

  // 5. Verify advancement
  const progressText = await page.locator(".progress-text").textContent();
  expect(progressText).not.toBe("0%");

  const scoreText = await page.locator(".score-value").textContent();
  expect(parseInt(scoreText || "0")).toBeGreaterThan(0);
});

test("Exercise failure keeps score/progress at zero", async ({ page }) => {
  await page.goto("/?debug=true");
  await page.click(".drop-button");

  await expect(page.locator(".drop-button")).toHaveCSS(
    "filter",
    "hue-rotate(90deg)",
  );

  await page.waitForTimeout(1000);

  // Purposely play the wrong notes until the exercise ends
  for (let i = 0; i < 40; i++) {
    const targetText = await page.getByText(/TARGET:/).textContent();
    if (!targetText) {
      await page.waitForTimeout(100);
      continue;
    }

    const targetKey = targetText.split("TARGET: ")[1]?.trim();
    if (!targetKey || targetKey === "END") {
      break;
    }

    const targetNoteLetter = targetKey.charAt(0).toUpperCase();
    const wrongNote = targetNoteLetter === "C" ? "D" : "C";
    await page.keyboard.press(wrongNote);
    await page.waitForTimeout(150);
  }

  await expect(page.getByText("TRY AGAIN")).toBeVisible({ timeout: 5000 });
  await expect(page.locator(".progress-text")).toHaveText("0%");
  await expect(page.locator(".score-value")).toHaveText("0");
});
