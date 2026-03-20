import {
  RestaurantMenuData,
  RestaurantMenuCategory,
  RestaurantMenuItem,
} from "../../types";

const categoryImages: Record<string, string> = {
  doener: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80",
  vegetarisch: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=1200&q=80",
  salat: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  vorspeisen: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80",
  softdrinks: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
  dessert: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
};

const sideOptions = [
  { name: "Pommes", price: 0 },
  { name: "Reis", price: 0 },
];

function item(
  categoryId: string,
  categoryName: string,
  data: Omit<RestaurantMenuItem, "pizza_id" | "image_url" | "categoryId" | "categoryName" | "flow">
): RestaurantMenuItem {
  const lower = data.name.toLowerCase();
  const requiresSide =
    lower.includes("teller") || lower.includes("box");
  const saucesIncluded = lower.includes("softdrink") || categoryId === "softdrinks" || categoryId === "dessert" ? 0 : 3;
  const drinkOptional = categoryId !== "softdrinks";

  return {
    ...data,
    pizza_id: `00000000-0000-4000-8000-${String(data.id).padStart(12, "0")}`,
    image_url: categoryImages[categoryId],
    categoryId,
    categoryName,
    flow: {
      sideRequired: requiresSide,
      sideOptions: requiresSide ? sideOptions : undefined,
      saucesIncluded,
      drinkOptional,
    },
  };
}

const categories: RestaurantMenuCategory[] = [
  {
    id: "doener",
    name: "DÖNER",
    items: [
      item("doener", "DÖNER", { id: 1, name: "Döner Kebab Kalb", price: 7.5, description: "Kalbfleisch, Salat, Soße" }),
      item("doener", "DÖNER", { id: 2, name: "Döner Kebab Hähnchen", price: 8, description: "Hähnchenfleisch, Salat, Soße" }),
      item("doener", "DÖNER", { id: 3, name: "Dnr Kebab mit extra Fleisch", price: 9.5, description: "Kalb- oder Hähnchenfleisch, Salat, Soße" }),
      item("doener", "DÖNER", { id: 4, name: "Döner Kebab mit Käse", price: 8, description: "Kalb- oder Hähnchenfleisch, Salat, Soße, Käse" }),
      item("doener", "DÖNER", { id: 5, name: "Dürüm Kalb", price: 8.5, description: "Kalbfleisch, Salat, Soße, Käse" }),
      item("doener", "DÖNER", { id: 6, name: "Dürüm Hähnchen", price: 8, description: "Hähnchenfleisch, Salat, Soße" }),
      item("doener", "DÖNER", { id: 7, name: "Dürüm mit extra Fleisch", price: 9.5, description: "Kalb- oder Hähnchenfleisch, Salat, Soße" }),
      item("doener", "DÖNER", { id: 8, name: "Special Döner", price: 9.5, description: "Kalb- & Hähnchenfleisch, Salat, Soße, Käse, gebratenes Gemüse" }),
      item("doener", "DÖNER", { id: 9, name: "Döner Teller Kalb", price: 10, description: "Kalbfleisch mit Pommes oder Reis, dazu Salat" }),
      item("doener", "DÖNER", { id: 10, name: "Döner Teller Hähnchen", price: 9.5, description: "Hähnchenfleisch mit Pommes oder Reis, dazu Salat" }),
      item("doener", "DÖNER", { id: 11, name: "Special Döner Teller", price: 12, description: "Kalb- & Hähnchenfleisch, Pommes oder Reis, dazu Salat, Käse, gebratenes Gemüse" }),
      item("doener", "DÖNER", { id: 12, name: "Döner Box Kalb", price: 7.5, description: "Mit Pommes oder Reis, dazu Salat" }),
      item("doener", "DÖNER", { id: 13, name: "Döner Box Hähnchen", price: 8.5, description: "Mit Pommes oder Reis, dazu Salat" }),
      item("doener", "DÖNER", { id: 14, name: "Lahmacun", price: 8, description: "Mit Salat und Fleisch" }),
      item("doener", "DÖNER", { id: 15, name: "Lahmacun", price: 7.5, description: "Mit Salat" }),
      item("doener", "DÖNER", { id: 16, name: "Lahmacun Spezial", price: 7, description: "Mit Fleisch, Käse, Salat" }),
    ],
  },
  {
    id: "vegetarisch",
    name: "VEGETARISCH",
    items: [
      item("vegetarisch", "VEGETARISCH", { id: 17, name: "Veggi Döner", price: 6, description: "Salat, Soße, Käse" }),
      item("vegetarisch", "VEGETARISCH", { id: 18, name: "Veggi Dürüm", price: 7, description: "Salat, Soße, Käse" }),
      item("vegetarisch", "VEGETARISCH", { id: 19, name: "Veggi Special Teller", price: 12, description: "Pommes oder Reis, dazu Salat, Käse, gebratenes Gemüse" }),
      item("vegetarisch", "VEGETARISCH", { id: 20, name: "Falafel Box", price: 8, description: "Falafel, Pommes oder Reis, dazu Salat" }),
      item("vegetarisch", "VEGETARISCH", { id: 21, name: "Falafel im Brot", price: 7.5, description: "Falafel, Salat, Soße" }),
      item("vegetarisch", "VEGETARISCH", { id: 22, name: "Falafel Dürüm", price: 8, description: "Falafel, Salat, Soße" }),
      item("vegetarisch", "VEGETARISCH", { id: 23, name: "Falafel Teller", price: 12, description: "Falafel, Pommes oder Reis, dazu Salat" }),
      item("vegetarisch", "VEGETARISCH", { id: 24, name: "Salat Box", price: 5, description: "Gemischter Salat" }),
      item("vegetarisch", "VEGETARISCH", { id: 25, name: "Käsebrot", price: 7.5, description: "Käse, Soße" }),
    ],
  },
  {
    id: "salat",
    name: "SALAT",
    items: [
      item("salat", "SALAT", { id: 26, name: "Bauern Salat", price: 8, description: "Tomaten, Paprika, Gurken, Petersilie" }),
      item("salat", "SALAT", { id: 27, name: "Hähnchen Salat", price: 8.5, description: "Hähnchenfleisch, gemischter Salat" }),
      item("salat", "SALAT", { id: 28, name: "Mix Salat", price: 5, description: "Gemischter Salat" }),
      item("salat", "SALAT", { id: 29, name: "Falafel Salat", price: 8, description: "Falafel, gemischter Salat" }),
      item("salat", "SALAT", { id: 30, name: "Special Salat", price: 7, description: "Gemischter Salat, Käse" }),
    ],
  },
  {
    id: "vorspeisen",
    name: "VORSPEISEN",
    items: [
      item("vorspeisen", "VORSPEISEN", { id: 31, name: "Zigaretten Börek (1 Stk.)", price: 2, description: "Knusprige Teigrolle mit Füllung" }),
      item("vorspeisen", "VORSPEISEN", { id: 32, name: "Pommes Klein", price: 3, description: "Kleine Portion Pommes" }),
      item("vorspeisen", "VORSPEISEN", { id: 33, name: "Pommes Groß", price: 5, description: "Große Portion Pommes" }),
      item("vorspeisen", "VORSPEISEN", { id: 34, name: "Süßkartoffeln Fritten", price: 4, description: "Knusprige Süßkartoffel-Pommes" }),
      item("vorspeisen", "VORSPEISEN", { id: 35, name: "Baklava (2 Stk.)", price: 4, description: "Süßes Blätterteig-Dessert" }),
      item("vorspeisen", "VORSPEISEN", { id: 36, name: "Zigaretten Börek (6 Stk.)", price: 7, description: "Knusprige Teigrollen mit Füllung" }),
    ],
  },
  {
    id: "softdrinks",
    name: "SOFTDRINKS",
    items: [
      item("softdrinks", "SOFTDRINKS", { id: 37, name: "fritz-kola 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 38, name: "fritz-kola superzero 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 39, name: "fritz-kola bio kola 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 40, name: "fritz-limo apfel-kirsch-holunder 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 41, name: "fritz-limo honigmelone 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 42, name: "fritz-limo orange 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 43, name: "fritz-limo zitrone 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 44, name: "fritz-spritz bio apfelschorle 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 45, name: "fritz-spritz bio rhabarberschorle 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 46, name: "fritz-spritz bio traubenschorle 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 47, name: "mischmasch kola + orange 0,33 l", price: 2.5, description: "Softdrink" }),
      item("softdrinks", "SOFTDRINKS", { id: 48, name: "anjola bio-limonade ananas & limette 0,33 l", price: 2.5, description: "Softdrink" }),
    ],
  },
  {
    id: "dessert",
    name: "DESSERT",
    items: [
      item("dessert", "DESSERT", { id: 49, name: "Baklava (2 Stk.)", price: 4, description: "Süßes Blätterteig-Dessert" }),
    ],
  },
];

export const restaurantMenuData: RestaurantMenuData = {
  categories,
  sauces: {
    title: "Soßen",
    maxFree: 3,
    options: [
      { id: "knoblauch", name: "Knoblauch", price: 0 },
      { id: "kraeuter", name: "Kräuter", price: 0 },
      { id: "scharf", name: "Scharf", price: 0 },
    ],
  },
  drinks: {
    title: "Softdrinks",
    size: "0,33 l",
    items: [
      { id: "drink1", name: "fritz-kola 0,33 l", price: 2.5 },
      { id: "drink2", name: "fritz-kola superzero 0,33 l", price: 2.5 },
      { id: "drink3", name: "fritz-kola bio kola 0,33 l", price: 2.5 },
      { id: "drink4", name: "fritz-limo apfel-kirsch-holunder 0,33 l", price: 2.5 },
      { id: "drink5", name: "fritz-limo honigmelone 0,33 l", price: 2.5 },
      { id: "drink6", name: "fritz-limo orange 0,33 l", price: 2.5 },
      { id: "drink7", name: "fritz-limo zitrone 0,33 l", price: 2.5 },
      { id: "drink8", name: "fritz-spritz bio apfelschorle 0,33 l", price: 2.5 },
      { id: "drink9", name: "fritz-spritz bio rhabarberschorle 0,33 l", price: 2.5 },
      { id: "drink10", name: "fritz-spritz bio traubenschorle 0,33 l", price: 2.5 },
      { id: "drink11", name: "mischmasch kola + orange 0,33 l", price: 2.5 },
      { id: "drink12", name: "anjola bio-limonade ananas & limette 0,33 l", price: 2.5 },
    ],
  },
};
