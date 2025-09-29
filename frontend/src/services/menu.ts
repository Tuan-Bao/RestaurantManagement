import api from './api';
import type { Category, MenuItem } from '../types/restaurant';

export const menuApi = {
  // Lấy danh sách categories
  getCategories: (params?: {
    name?: string;
  }) => {
    return api.get<{
      success: boolean;
      data: Category[];
      message?: string;
    }>('/menu/categories/', { params });
  },

  // Lấy danh sách menu items
  getMenuItems: (params?: {
    name?: string;
    category?: number;
    status?: 'available' | 'unavailable';
  }) => {
    return api.get<{
      success: boolean;
      data: MenuItem[];
      message?: string;
    }>('/menu/items/', { params });
  },

  // Lấy chi tiết menu item
  getMenuItem: (itemId: number) => {
    return api.get<{
      success: boolean;
      data: MenuItem;
      message?: string;
    }>(`/menu/items/${itemId}/`);
  }
};