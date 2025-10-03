export interface Table {
  id: number;
  name: string;
  floor: number;
  status: "available" | "unavailable";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: number;
  ingredient: number;
  ingredient_name?: string;
  ingredient_unit?: string;
  quantity_required: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  quantity_in_stock: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  category: number;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  status: "available" | "unavailable";
  recipes?: Recipe[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  table_id: number;
  table?: Table;
  status: "unpaid" | "paid";
  created_at: string;
  closed_at?: string;
  updated_at: string;
  order_items?: OrderItem[];
  total_amount?: number;
  tableName?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item?: MenuItem;
  menu_item_name: string;
  user_id: number;
  quantity: number;
  note?: string;
  status: "ordered" | "cancelled" | "cooking" | "done";
  price_each: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  discount: number;
  tax: number;
  method: "cash" | "card" | "e_wallet";
  created_at: string;
  updated_at: string;
}
