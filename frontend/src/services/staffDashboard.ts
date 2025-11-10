import api from "./api";

export interface StaffStats {
  tables: {
    total: number;
    occupied: number;
    available: number;
  };
  orders: {
    today: number;
    pending: number;
  };
  revenue: {
    today: number;
  };
  alerts: {
    low_stock_count: number;
  };
}

export interface ActiveOrderItem {
  menu_item_name: string;
  quantity: number;
  price: number;
  status: string;
}

export interface ActiveOrder {
  id: number;
  table: {
    id: number | null;
    name: string;
  };
  status: string;
  created_at: string;
  waiting_minutes: number;
  total_amount: number;
  items_count: number;
  items: ActiveOrderItem[];
  staff_name: string;
}

export interface Alert {
  type: "warning" | "danger" | "info";
  icon: string;
  message: string;
  order_id?: number;
  ingredient_name?: string;
  count?: number;
}

export const staffDashboardApi = {
  getStats: async (): Promise<StaffStats> => {
    const response = await api.get("/dashboard/staff/stats/");
    return response.data.data;
  },

  getActiveOrders: async (): Promise<ActiveOrder[]> => {
    const response = await api.get("/dashboard/staff/active-orders/");
    return response.data.data;
  },

  getAlerts: async (): Promise<Alert[]> => {
    const response = await api.get("/dashboard/staff/alerts/");
    return response.data.data;
  },
};

export default staffDashboardApi;
