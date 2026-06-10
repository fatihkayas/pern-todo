import { test, expect } from "@playwright/test";
import { mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
  await page.goto("/");
  await page.getByText("Seiko 5 Sports").waitFor();
  // Ensure no leftover auth token from a previous test
  await page.evaluate(() => localStorage.removeItem("token"));
});

// ── Opening the cart ────────────────────────────────────────────────────────

test("clicking + CART opens the cart sidebar", async ({ page }) => {
  await page.getByRole("button", { name: "+ CART" }).first().click();
  await expect(page.getByText(/Sepetim/)).toBeVisible();
});

test("cart sidebar shows the added item name", async ({ page }) => {
  await page.getByRole("button", { name: "+ CART" }).first().click();
  await expect(page.locator("div").filter({ hasText: /^Seiko 5 Sports$/ })).toBeVisible();
});

test("cart header shows correct item count after add", async ({ page }) => {
  await page.getByRole("button", { name: "+ CART" }).first().click();
  await expect(page.getByText(/Sepetim \(1\)/)).toBeVisible();
});

// ── Quantity controls ───────────────────────────────────────────────────────

test("clicking + increases the cart item count", async ({ page }) => {
  await page.getByRole("button", { name: "+ CART" }).first().click();
  await expect(page.getByText(/Sepetim \(1\)/)).toBeVisible();

  await page.getByRole("button", { name: "+", exact: true }).click();
  await expect(page.getByText(/Sepetim \(2\)/)).toBeVisible();
});

test("clicking − decreases the cart item count", async ({ page }) => {
  await page.getByRole("button", { name: "+ CART" }).first().click();
  await page.getByRole("button", { name: "+", exact: true }).click();
  await expect(page.getByText(/Sepetim \(2\)/)).toBeVisible();

  await page.getByRole("button", { name: "−" }).click();
  await expect(page.getByText(/Sepetim \(1\)/)).toBeVisible();
});

// ── Checkout auth gate ──────────────────────────────────────────────────────

test("checkout without a token redirects to /login", async ({ page }) => {
  await page.getByRole("button", { name: "+ CART" }).first().click();
  await page.getByText("Proceed to Checkout →").click();
  await expect(page).toHaveURL("/login");
});

test("checkout button is not shown when cart is empty", async ({ page }) => {
  await expect(page.getByText("Proceed to Checkout →")).not.toBeVisible();
});
