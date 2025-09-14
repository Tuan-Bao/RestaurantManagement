export interface Ingredient {
  id: number;
  name: string;
  unit: "kg" | "liter" | "piece";
  created_at: string;
  updated_at: string;
}

export interface Storage {
  id: number;
  ingredient_id: number;
  ingredient?: Ingredient;
  stock_quantity: number;
  min_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface StockIn {
  id: number;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  price: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface StockOut {
  id: number;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity: number;
  reason: "cooking" | "cancel" | "other";
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: number;
  menu_item_id: number;
  menu_item?: any;
  ingredient_id: number;
  ingredient?: Ingredient;
  quantity_required: number;
  created_at: string;
  updated_at: string;
}
