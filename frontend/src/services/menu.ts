import api from './api';
import type { Category, MenuItem } from '../types/restaurant';

export const menuApi = {
  // Categories
  getCategories: (params?: {
    name?: string;
  }) => {
    return api.get<{
      success: boolean;
      data: Category[];
      message?: string;
    }>('/menu/categories/', { params });
  },

  createCategory: (data: {
    name: string;
    description?: string;
  }) => {
    return api.post<{
      success: boolean;
      data: Category;
      message?: string;
    }>('/menu/categories/', data);
  },

  updateCategory: (id: number, data: {
    name: string;
    description?: string;
  }) => {
    return api.put<{
      success: boolean;
      data: Category;
      message?: string;
    }>(`/menu/categories/${id}/`, data);
  },

  deleteCategory: (id: number) => {
    return api.delete<{
      success: boolean;
      message?: string;
    }>(`/menu/categories/${id}/`);
  },

  // Menu Items
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

  getMenuItem: (itemId: number) => {
    return api.get<{
      success: boolean;
      data: MenuItem;
      message?: string;
    }>(`/menu/items/${itemId}/`);
  },

  createMenuItem: (data: FormData) => {
    return api.post<{
      success: boolean;
      data: MenuItem;
      message?: string;
    }>('/menu/items/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateMenuItem: (id: number, data: FormData) => {
    return api.put<{
      success: boolean;
      data: MenuItem;
      message?: string;
    }>(`/menu/items/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteMenuItem: (id: number) => {
    return api.delete<{
      success: boolean;
      message?: string;
    }>(`/menu/items/${id}/`);
  }
};