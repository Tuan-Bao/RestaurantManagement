import api from './api';
import type { Table } from '../types/restaurant';

export interface TableStats {
  total: number;
  available: number;
  unavailable: number;
  by_floor: Record<string, {
    total: number;
    available: number;
    unavailable: number;
  }>;
}

export const tablesApi = {
  // Lấy danh sách bàn
  getTables: (params?: {
    floor?: number;
    status?: string;
    search?: string;
  }) => {
    return api.get<{
      success: boolean;
      data: Table[];
      message?: string;
    }>('/tables/', { params });
  },

  // Lấy thống kê bàn
  getTableStats: () => {
    return api.get<{
      success: boolean;
      data: TableStats;
      message?: string;
    }>('/tables/stats/');
  },

  // Thay đổi trạng thái bàn
  updateTableStatus: (tableId: number, status: 'available' | 'unavailable') => {
    return api.patch<{
      success: boolean;
      data: Table;
      message?: string;
    }>(`/tables/${tableId}/status/`, { status });
  },

  // Lấy chi tiết bàn
  getTableDetail: (tableId: number) => {
    return api.get<{
      success: boolean;
      data: Table;
      message?: string;
    }>(`/tables/${tableId}/`);
  }
};