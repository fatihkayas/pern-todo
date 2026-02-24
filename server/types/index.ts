// DTO types shared across backend routes

export interface AuthPayload {
  customer_id: number;
  email: string;
}

export interface Watch {
  watch_id: number;
  watch_name: string;
  brand: string;
  price: string; // PostgreSQL DECIMAL returns as string
  image_url: string;
  stock_quantity: number;
  description?: string;
}

export interface Customer {
  customer_id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  is_admin: boolean;
  password_hash?: string;
}

export interface Order {
  order_id: number;
  customer_id: number | null;
  total_amount: string; // DECIMAL
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address?: string;
  payment_intent_id?: string;
  order_date: Date;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  watch_id: number;
  quantity: number;
  unit_price: string; // DECIMAL
  subtotal: string; // DECIMAL
}
