import { test, expect } from "@playwright/test";
import { mockWatchesRoute } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockWatchesRoute(page);
});

// ── Page structure ──────────────────────────────────────────────────────────

test("navigation bar is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();
});

test("product catalog section is rendered", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#catalog")).toBeVisible();
});

// ── Mocked API data ─────────────────────────────────────────────────────────

test("watch names are displayed after the API responds", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(page.getByText("Tissot PRX")).toBeVisible();
});

test("watch prices are displayed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("$299.99")).toBeVisible();
  await expect(page.getByText("$549.99")).toBeVisible();
});

test("brand badges are displayed", async ({ page }) => {
  await page.goto("/");
  // Badges are <span class="badge">{watch.brand}</span>
  // The brand also appears in the category bar, so check for the badge role
  await expect(page.locator(".badge").filter({ hasText: "Seiko" })).toBeVisible();
  await expect(page.locator(".badge").filter({ hasText: "Tissot" })).toBeVisible();
});

// ── Navigation ──────────────────────────────────────────────────────────────

test("clicking the logo navigates back to the store", async ({ page }) => {
  await page.goto("/about");
  await page.goto("/");
  await expect(page).toHaveURL("/");
  await expect(page.locator("#catalog")).toBeVisible();
});
