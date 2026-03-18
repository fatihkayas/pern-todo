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
  size: string;
  toppings: string[];
  side?: string;
  sauces?: string[];
  drink?: string;
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
  category?: "pizza" | "doner" | "panini";
}

export interface PizzaCartItem extends Pizza {
  cart_item_id: string;
  quantity: number;
  options: PizzaOptions;
}
