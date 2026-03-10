import type { Page } from "@playwright/test";

// ── Mock watch catalogue ────────────────────────────────────────────────────
// Description is crafted so each filter keyword hits exactly one watch:
//   "automatic" / "steel"  → Watch 1 (Seiko)
//   "quartz"   / "leather" / "blue" → Watch 2 (Tissot)
export const MOCK_WATCHES = [
  {
    watch_id: 1,
    watch_name: "Seiko 5 Sports",
    brand: "Seiko",
    price: "299.99",
    image_url: "https://picsum.photos/seed/seiko/400",
    stock_quantity: 10,
    description: "automatic sport watch steel dial black",
    model_code: "SRPD55K1",
  },
  {
    watch_id: 2,
    watch_name: "Tissot PRX",
    brand: "Tissot",
    price: "549.99",
    image_url: "https://picsum.photos/seed/tissot/400",
    stock_quantity: 5,
    description: "quartz classic leather strap blue dial",
    model_code: "T137.410.11.051.00",
  },
];

// ── Route helper ────────────────────────────────────────────────────────────
// Call BEFORE page.goto() to intercept the watches fetch made by App.tsx.
export async function mockWatchesRoute(page: Page): Promise<void> {
  await page.route("**/api/v1/watches", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_WATCHES),
    })
  );
}
