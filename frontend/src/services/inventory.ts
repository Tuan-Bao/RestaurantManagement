import api from './api';
import type { Ingredient } from '../types/restaurant';

export const inventoryApi = {
  getIngredients: (params?: {
    name?: string;
  }) => {
    return api.get<{
      success: boolean;
      data: Ingredient[];
      message?: string;
    }>('/inventory/ingredients/', { params });
  },
};