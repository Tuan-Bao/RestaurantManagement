import api from "./api";

export interface DashboardStats {
  orders: {
    total: number;
    today: number;
    unpaid: number;
    paid: number;
    change_percent: number;
  };
  revenue: {
    total: number;
    today: number;
    this_month: number;
    change_percent: number;
  };
  tables: {
    total: number;
    available: number;
    unavailable: number;
  };
  menu: {
    total: number;
    available: number;
    unavailable: number;
    categories: number;
  };
  ingredients: {
    total: number;
    low_stock: number;
  };
}

export interface RecentOrder {
  id: number;
  table: {
    id: number;
    name: string;
  };
  status: string;
  created_at: string;
  total_amount: number;
  items_count: number;
}

export interface TopMenuItem {
  id: number;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders_count: number;
}

export const dashboardApi = {
  // Lấy thống kê tổng quan
  getStats: () => {
    return api.get<{
      success: boolean;
      data: DashboardStats;
      message?: string;
    }>("/dashboard/stats/");
  },

  // Lấy đơn hàng gần đây
  getRecentOrders: (limit: number = 10) => {
    return api.get<{
      success: boolean;
      data: RecentOrder[];
      message?: string;
    }>("/dashboard/recent-orders/", { params: { limit } });
  },

  // Lấy món ăn bán chạy
  getTopMenuItems: (limit: number = 10, days: number = 30) => {
    return api.get<{
      success: boolean;
      data: TopMenuItem[];
      message?: string;
    }>("/dashboard/top-items/", { params: { limit, days } });
  },

  // Lấy doanh thu theo ngày
  getRevenueByDay: (days: number = 7) => {
    return api.get<{
      success: boolean;
      data: RevenueByDay[];
      message?: string;
    }>("/dashboard/revenue-by-day/", { params: { days } });
  },
};
