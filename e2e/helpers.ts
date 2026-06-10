import type { Page } from "@playwright/test";

// ── Mock watch catalogue ────────────────────────────────────────────────────
// No model_code set so WatchCard renders watch_name (model_code || watch_name).
export const MOCK_WATCHES = [
  {
    watch_id: 1,
    watch_name: "Seiko 5 Sports",
    brand: "Seiko",
    price: "299.99",
    image_url: "https://picsum.photos/seed/seiko/400",
    stock_quantity: 10,
    description: "automatic sport watch steel dial black",
  },
  {
    watch_id: 2,
    watch_name: "Tissot PRX",
    brand: "Tissot",
    price: "549.99",
    image_url: "https://picsum.photos/seed/tissot/400",
    stock_quantity: 5,
    description: "quartz classic leather strap blue dial",
  },
];

// ── Brands-summary shape expected by Store.tsx ──────────────────────────────
export const MOCK_BRANDS_SUMMARY = [
  { brand: "Seiko", count: 1, watches: [MOCK_WATCHES[0]] },
  { brand: "Tissot", count: 1, watches: [MOCK_WATCHES[1]] },
];

// ── Route helpers ────────────────────────────────────────────────────────────
// Intercepts both API calls made by Store.tsx:
//   GET /api/v1/watches/brands-summary  → grouped brand data (initial load)
//   GET /api/v1/watches?…               → filtered watch list (search / brand)
export async function mockApiRoutes(page: Page): Promise<void> {
  await page.route("**/api/v1/watches/brands-summary", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_BRANDS_SUMMARY),
    })
  );

  // Matches /api/v1/watches and /api/v1/watches?brand=…&search=… but NOT
  // /api/v1/watches/brands-summary (which is already handled above).
  await page.route(/\/api\/v1\/watches(\?|$)/, (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const brand = url.searchParams.get("brand")?.toLowerCase() ?? "";
    const filtered = MOCK_WATCHES.filter((w) => {
      if (brand && w.brand.toLowerCase() !== brand) return false;
      if (search && !`${w.watch_name} ${w.brand} ${w.description}`.toLowerCase().includes(search))
        return false;
      return true;
    });
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(filtered),
    });
  });
}
