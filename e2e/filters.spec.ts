import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
  await page.goto("/");
  // Wait for the mocked data to render
  await page.getByText("Seiko 5 Sports").waitFor();
});

// ── Sidebar search ──────────────────────────────────────────────────────────

test("sidebar search input is visible", async ({ page }) => {
  await expect(page.getByPlaceholder("Suchen...")).toBeVisible();
});

test("searching by brand name shows only matching watches", async ({ page }) => {
  await page.getByPlaceholder("Suchen...").fill("seiko");
  await page.getByPlaceholder("Suchen...").press("Enter");
  await expect(page.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(page.getByText("Tissot PRX")).not.toBeVisible();
});

test("searching by watch name shows only matching watches", async ({ page }) => {
  await page.getByPlaceholder("Suchen...").fill("PRX");
  await page.getByPlaceholder("Suchen...").press("Enter");
  await expect(page.getByText("Tissot PRX")).toBeVisible();
  await expect(page.getByText("Seiko 5 Sports")).not.toBeVisible();
});

test("clearing search restores all watches", async ({ page }) => {
  await page.getByPlaceholder("Suchen...").fill("seiko");
  await page.getByPlaceholder("Suchen...").press("Enter");
  await expect(page.getByText("Tissot PRX")).not.toBeVisible();

  await page.getByPlaceholder("Suchen...").fill("");
  await page.getByPlaceholder("Suchen...").press("Enter");
  await expect(page.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(page.getByText("Tissot PRX")).toBeVisible();
});

test("empty results message appears when search matches nothing", async ({ page }) => {
  await page.getByPlaceholder("Suchen...").fill("xyznonexistent");
  await page.getByPlaceholder("Suchen...").press("Enter");
  await expect(page.getByText("Keine Uhren gefunden.")).toBeVisible();
});

// ── Brand radio buttons ─────────────────────────────────────────────────────

test("brand radio buttons include mocked brands", async ({ page }) => {
  await expect(page.getByLabel("Seiko")).toBeVisible();
  await expect(page.getByLabel("Tissot")).toBeVisible();
});

test("selecting a brand shows only that brand's watches", async ({ page }) => {
  await page.getByLabel("Seiko").click();
  await expect(page.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(page.getByText("Tissot PRX")).not.toBeVisible();
});

test("selecting Tissot shows only Tissot watches", async ({ page }) => {
  await page.getByLabel("Tissot").click();
  await expect(page.getByText("Tissot PRX")).toBeVisible();
  await expect(page.getByText("Seiko 5 Sports")).not.toBeVisible();
});

test("selecting Alle Marken after a brand filter restores all watches", async ({ page }) => {
  await page.getByLabel("Seiko").click();
  await expect(page.getByText("Tissot PRX")).not.toBeVisible();

  await page.getByLabel("Alle Marken").click();
  await expect(page.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(page.getByText("Tissot PRX")).toBeVisible();
});
