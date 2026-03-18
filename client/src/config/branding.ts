export type ShopDomain = "watch" | "pizza";

const domain = (process.env.REACT_APP_SHOP_DOMAIN || "watch") as ShopDomain;

const configs = {
  watch: {
    name: "Seiko Watch Store",
    tagline: "Precision. Elegance. Time.",
    primaryColor: "#1a1a2e",
    accentColor: "#c9a84c",
    productLabel: "watch",
    apiPath: "/api/v1/watches",
    orderApiPath: "/api/v1/orders",
    chatContext: "You are a watch store assistant.",
  },
  pizza: {
    name: "Pizza & Doner Haus",
    tagline: "Fresh from the oven. Hot from the grill.",
    primaryColor: "#120f0f",
    accentColor: "#e63946",
    productLabel: "menu item",
    apiPath: "/api/v1/pizza",
    orderApiPath: "/api/v1/pizza/orders",
    chatContext: "You are a restaurant assistant for a pizza and doner shop.",
  },
} as const;

export const SHOP = configs[domain];
export const IS_PIZZA = domain === "pizza";
export const IS_WATCH = domain === "watch";
