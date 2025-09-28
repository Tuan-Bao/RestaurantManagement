export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  image?: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recipe?: {
    instructions: string[];
    cookingTime: number;
    servingSize: number;
    difficulty: "easy" | "medium" | "hard";
    equipment: string[];
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}
