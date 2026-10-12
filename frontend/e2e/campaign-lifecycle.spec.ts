import { expect, test } from "@playwright/test";

test("user can configure and activate a campaign",
  async ({page}) => {
    const email = `e2e-test@example.com`;
    const campaignName = `E2E 2026 Campaign`;

    // 1. Registration
    await page.goto("/register");
    await page.getByLabel(/display name/i).fill("E2E Alice");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill("StrongPassword123!");
    await page.getByRole("button", { name: /register|create account/i }).click();

    // 2. Dashboard loads
    await expect(page.getByRole("heading", { name: "Campaigns", exact: true })).toBeVisible();

    // 3. Create a new campaign
    await page.getByLabel(/name/i).fill(campaignName);
    await page.getByLabel(/budget/i).fill("5000");
    
    await page.getByRole("button", { name: /create campaign/i }).click();

    // 4. Verify it appeared in the list
    await expect(page.getByText(campaignName, {exact: true})).toBeVisible();

    // 5. Click the "View campaign" link inside that specific campaign card
    const campaignCard = page.locator('.campaign-card').filter({ hasText: campaignName });
    await campaignCard.getByRole('link', { name: /view campaign/i }).click();

    // 6. Wait for the detail page to load
    await expect(page.getByRole("heading", { name: /campaign readiness/i })).toBeVisible();

    // 7. Verify Activation is blocked without creatives
    const activateButton = page.getByRole("button", { name: /move to active/i });
    await expect(activateButton).toBeDisabled();
    await expect(page.getByText(/add at least one creative before activating/i).first()).toBeVisible();

    // 8. Add a Creative
    await page.getByLabel(/headline/i).fill("E2E Launch Creative");
    await page.getByLabel(/^body$/i).fill("Created by the Playwright E2E test");
    await page.getByLabel(/destination url/i).fill("https://example.com/e2e");
    await page.getByRole("button", { name: /add creative|create creative/i }).click();

    // 9. Verify Creative was added and Activation is now unlocked
    await expect(page.getByText("E2E Launch Creative")).toBeVisible();
    await expect(activateButton).toBeEnabled();

    // 10. Update Targeting
    const countriesInput = page.getByLabel("Countries");
    await countriesInput.fill("fi, SE");
    await page.getByRole("checkbox", { name: /mobile/i }).check();
    await page.getByLabel("Minimum age").fill("18");
    await page.getByLabel("Maximum age").fill("40");
    await page.getByRole("button", { name: /save targeting/i }).click();

    await expect(page.getByText(/targeting saved/i)).toBeVisible();
    await expect(countriesInput).toHaveValue("FI, SE");

    // 11. Activate the campaign
    await activateButton.click();

    // 12. Verify Active Status behavior
    const statusSection = page.getByRole("heading", { name: "Campaign Status" }).locator("..");
    await expect(statusSection).toContainText("Active");
    
    await expect(countriesInput).toBeDisabled();
    await expect(page.getByRole("button", { name: /save targeting/i })).toHaveCount(0);
    await expect(page.getByText(/new creatives can only be added/i)).toBeVisible();

    // 13. Reload the page and verify state persists
    await page.reload();
    await expect(page.getByRole("heading", { name: campaignName })).toBeVisible();
    await expect(page.getByLabel("Countries")).toHaveValue("FI, SE");
    await expect(page.getByLabel("Countries")).toBeDisabled();
    await expect(page.getByText("E2E Launch Creative")).toBeVisible();

    const reloadedStatusSection = page.getByRole("heading", { name: "Campaign Status" }).locator("..");
    await expect(reloadedStatusSection).toContainText("Active");
  }
);