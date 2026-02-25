export interface Watch {
  watch_id: number;
  watch_name: string;
  brand: string;
  price: string; // PostgreSQL DECIMAL returns as string
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
  watch_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  order_id: number;
  customer_id: number | null;
  total_amount: string;
  status: OrderStatus;
  shipping_address: string;
  order_date: string;
  items?: OrderItem[];
  // admin-only fields
  full_name?: string;
  email?: string;
}

export interface AdminStats {
  orders: { total: string; pending: string };
  customers: { total: string };
  revenue: { total: string };
  watches: { total: string; low_stock: string };
}
