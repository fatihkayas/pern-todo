import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

// ── Page structure ──────────────────────────────────────────────────────────

test("navigation bar is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();
});

test("brand section headings are rendered after the API responds", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Seiko/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Tissot/ })).toBeVisible();
});

// ── Mocked API data ─────────────────────────────────────────────────────────

test("watch names are displayed after the API responds", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Seiko 5 Sports")).toBeVisible();
  await expect(page.getByText("Tissot PRX")).toBeVisible();
});

test("watch prices are displayed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("€299.99")).toBeVisible();
  await expect(page.getByText("€549.99")).toBeVisible();
});

test("brand names are shown on watch cards", async ({ page }) => {
  await page.goto("/");
  // WatchCard renders brand as uppercase
  await expect(page.getByText("SEIKO").first()).toBeVisible();
  await expect(page.getByText("TISSOT").first()).toBeVisible();
});

// ── Navigation ──────────────────────────────────────────────────────────────

test("navigating to / shows the watch catalog", async ({ page }) => {
  await page.goto("/about");
  await page.goto("/");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: /Seiko/ })).toBeVisible();
});
