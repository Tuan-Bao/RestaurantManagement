// Inventory Types
export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  stock_quantity: number;
  min_quantity: number;
  price_per_unit?: number;
  status: 'active' | 'inactive';
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface StockIn {
  id: number;
  ingredient: Ingredient;
  quantity: number;
  price?: number;
  price_per_unit: number;
  user: User;
  created_at: string;
}

export interface StockOut {
  id: number;
  ingredient: Ingredient;
  quantity: number;
  reason: 'cooking' | 'expired' | 'damaged' | 'other';
  user: User;
  order_item?: any; // OrderItem type if needed
  notes?: string;
  created_at: string;
}

// API Response Types
export interface WarehouseResponse {
  success: boolean;
  data: Ingredient[];
  summary: {
    total_ingredients: number;
    low_stock_items: number;
  };
}

export interface StockInResponse {
  success: boolean;
  data: StockIn[];
  summary: {
    total_records: number;
  };
}

export interface StockOutResponse {
  success: boolean;
  data: StockOut[];
  summary: {
    total_records: number;
  };
}

// Form Types
export interface StockInCreateData {
  ingredient_name: string;
  ingredient_unit: string;
  min_quantity?: number;
  quantity: number;
  price?: number;
}

export interface StockOutCreateData {
  ingredient_name: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'other';
  notes?: string;
}

export interface IngredientUpdateData {
  name: string;
  unit: string;
  min_quantity?: number;
}

// Filter Types
export interface WarehouseFilters {
  name?: string;
  status?: 'active' | 'inactive';
  low_stock?: boolean;
}

export interface StockHistoryFilters {
  ingredient_name?: string;
  date_from?: string;
  date_to?: string;
  reason?: string;
}

// Unit Choices
export const UNIT_CHOICES = [
  { value: 'kg', label: 'Kilogram' },
  { value: 'liter', label: 'Liter' },
  { value: 'piece', label: 'Piece' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'can', label: 'Can' },
  { value: 'set', label: 'Set' },
  { value: 'other', label: 'Other' },
] as const;

// Reason Choices
export const REASON_CHOICES = [
  { value: 'expired', label: 'Expired' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'other', label: 'Other' },
] as const;
