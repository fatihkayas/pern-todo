import { test, expect, Locator } from "@playwright/test";
import { mockWatchesRoute } from "./helpers";

// Scope all filter/search selectors to the SmartFiltersGrid section.
// Both CircularCategoryBar and SmartFiltersGrid render "All" and "Automatic"
// buttons, so scoping to #catalog avoids ambiguity.
let catalog: Locator;

test.beforeEach(async ({ page }) => {
  await mockWatchesRoute(page);
  await page.goto("/");
  // Wait for the mocked data to render
  await page.getByText("Seiko 5 Sports").waitFor();
  catalog = page.locator("#catalog");
});

// ── Filter buttons ──────────────────────────────────────────────────────────

test("all seven filter buttons are rendered", async ({ page }) => {
  for (const label of ["All", "Automatic", "Quartz", "Steel Strap", "Leather Strap", "Black Dial", "Blue Dial"]) {
    await expect(catalog.getByRole("button", { name: label })).toBeVisible();
  }
});

test("Automatic filter shows only the Seiko watch", async ({ page }) => {
  await catalog.getByRole("button", { name: "Automatic" }).click();
  await expect(catalog.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(catalog.getByText("Tissot PRX")).not.toBeVisible();
});

test("Quartz filter shows only the Tissot watch", async ({ page }) => {
  await catalog.getByRole("button", { name: "Quartz" }).click();
  await expect(catalog.getByText("Tissot PRX")).toBeVisible();
  await expect(catalog.getByText("Seiko 5 Sports")).not.toBeVisible();
});

test("Steel Strap filter shows only the Seiko watch", async ({ page }) => {
  await catalog.getByRole("button", { name: "Steel Strap" }).click();
  await expect(catalog.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(catalog.getByText("Tissot PRX")).not.toBeVisible();
});

test("Blue Dial filter shows only the Tissot watch", async ({ page }) => {
  await catalog.getByRole("button", { name: "Blue Dial" }).click();
  await expect(catalog.getByText("Tissot PRX")).toBeVisible();
  await expect(catalog.getByText("Seiko 5 Sports")).not.toBeVisible();
});

test("clicking All after a filter restores all watches", async ({ page }) => {
  await catalog.getByRole("button", { name: "Automatic" }).click();
  await expect(catalog.getByText("Tissot PRX")).not.toBeVisible();

  await catalog.getByRole("button", { name: "All" }).click();
  await expect(catalog.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(catalog.getByText("Tissot PRX")).toBeVisible();
});

// ── Search ──────────────────────────────────────────────────────────────────

test("searching by brand name shows only matching watches", async ({ page }) => {
  await catalog.getByPlaceholder("Search by model or brand...").fill("seiko");
  await expect(catalog.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(catalog.getByText("Tissot PRX")).not.toBeVisible();
});

test("searching by watch name shows only matching watches", async ({ page }) => {
  await catalog.getByPlaceholder("Search by model or brand...").fill("PRX");
  await expect(catalog.getByText("Tissot PRX")).toBeVisible();
  await expect(catalog.getByText("Seiko 5 Sports")).not.toBeVisible();
});

test("clearing search restores all watches", async ({ page }) => {
  await catalog.getByPlaceholder("Search by model or brand...").fill("seiko");
  await expect(catalog.getByText("Tissot PRX")).not.toBeVisible();

  await catalog.getByPlaceholder("Search by model or brand...").fill("");
  await expect(catalog.getByText("Tissot PRX")).toBeVisible();
});

test("empty results message appears when search matches nothing", async ({ page }) => {
  await catalog.getByPlaceholder("Search by model or brand...").fill("xyznonexistent");
  await expect(catalog.getByText("No watches found for your current filters.")).toBeVisible();
});
