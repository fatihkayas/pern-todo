export interface Watch {
  watch_id: number;
  watch_name: string;
  brand: string;
  price: string;
  image_url: string;
  stock_quantity: number;
  description?: string;
  model_code?: string;
}

export interface CartItem extends Watch {
  quantity: number;
}

export interface Customer {
  customer_id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  isProfileCompleted?: boolean;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  watch_id?: string;
  watch_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  order_id: string;
  customer_id: number | null;
  total_amount: string;
  status: OrderStatus;
  shipping_address: string;
  order_date: string;
  items?: OrderItem[];
  full_name?: string;
  email?: string;
}

export interface AdminStats {
  orders: { total: string; pending: string };
  customers: { total: string };
  revenue: { total: string };
  watches: { total: string; low_stock: string };
}

export interface PizzaOptions {
  size?: string;
  toppings: string[];
  side?: string;
  sidePrice?: number;
  extra?: string;
  extraPrice?: number;
  sauces?: string[];
  drink?: string;
  drinkPrice?: number;
}

export interface Pizza {
  pizza_id: string;
  name: string;
  description?: string;
  base_price: string;
  image_url?: string;
  sizes: string[];
  toppings: string[];
  is_available: boolean;
  category?: string;
}

export interface PizzaCartItem extends Pizza {
  cart_item_id: string;
  quantity: number;
  options: PizzaOptions;
  allergens?: string[];
}

export interface MenuSideOption {
  name: string;
  price: number;
}

export interface MenuItemFlow {
  sideRequired: boolean;
  sideOptions?: MenuSideOption[];
  saucesIncluded: number;
  drinkOptional: boolean;
}

export interface RestaurantMenuItem {
  id: number;
  pizza_id: string;
  name: string;
  price: number;
  description: string;
  tags?: string[];
  allergens?: string[];
  image_url?: string;
  categoryId: string;
  categoryName: string;
  flow: MenuItemFlow;
}

export interface RestaurantMenuCategory {
  id: string;
  name: string;
  items: RestaurantMenuItem[];
}

export interface MenuSauceOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuDrinkItem {
  id: string;
  name: string;
  price: number;
}

export interface RestaurantMenuData {
  categories: RestaurantMenuCategory[];
  sauces: {
    title: string;
    maxFree: number;
    options: MenuSauceOption[];
  };
  drinks: {
    title: string;
    size: string;
    items: MenuDrinkItem[];
  };
}
