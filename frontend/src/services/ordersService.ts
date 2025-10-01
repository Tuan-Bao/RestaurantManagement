import api from './api';
import type { Order, OrderItem } from '../types/order';

export interface OrdersResponse {
    success: boolean;
    data: Order[];
    total: number;
}

export interface OrderDetailResponse {
    success: boolean;
    data: Order;
}

export interface OrderStatsResponse {
    success: boolean;
    data: {
        total_orders: number;
        active_orders: number;
        completed_orders: number;
        cancelled_orders: number;
        total_revenue: number;
    };
}

export interface OrderFilters {
    table?: number;
    status?: string;
    floor?: number;
    date_from?: string;
    date_to?: string;
    table_name?: string;
}

export const ordersService = {
    // Lấy danh sách đơn hàng với filter và phân trang
    getOrders: async (filters?: OrderFilters): Promise<OrdersResponse> => {
        const params = new URLSearchParams();

        if (filters?.table) params.append('table', filters.table.toString());
        if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters?.floor) params.append('floor', filters.floor.toString());
        if (filters?.date_from) params.append('date_from', filters.date_from);
        if (filters?.date_to) params.append('date_to', filters.date_to);
        if (filters?.table_name) params.append('table_name', filters.table_name);

        const response = await api.get(`/orders/?${params.toString()}`);
        return response.data;
    },

    // Lấy chi tiết đơn hàng
    getOrderDetail: async (orderId: number): Promise<OrderDetailResponse> => {
        const response = await api.get(`/orders/${orderId}/`);
        return response.data;
    },

    // Lấy đơn hàng theo bàn
    getOrderByTable: async (tableId: number): Promise<OrderDetailResponse> => {
        const response = await api.get(`/orders/table/${tableId}/`);
        return response.data;
    },

    // Lấy thống kê đơn hàng
    getOrderStats: async (): Promise<OrderStatsResponse> => {
        const response = await api.get('/orders/stats/');
        return response.data;
    },

    // Tạo đơn hàng mới
    createOrder: async (orderData: {
        table: number;
        items: Array<{
            menu_item: number;
            quantity: number;
            note?: string;
        }>;
    }): Promise<OrderDetailResponse> => {
        const response = await api.post('/orders/', orderData);
        return response.data;
    },

    // Cập nhật trạng thái món ăn
    updateOrderItemStatus: async (itemId: number, status: 'ordered' | 'cooking' | 'done' | 'served' | 'cancelled') => {
        try {
            const response = await api.patch(`/orders/items/${itemId}/status/`, { status });
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error.response?.data?.message || error.message);
            throw error;
        }
    },    // Cập nhật món trong đơn hàng
    updateOrderItems: async (orderId: number, items: Array<{
        menu_item: number;
        quantity: number;
        note?: string;
    }>) => {
        const response = await api.patch(`/orders/${orderId}/items/`, items);
        return response.data;
    },

    // Tạo thanh toán
    createPayment: async (orderId: number, paymentData: {
        amount: number;
        discount?: number;
        tax?: number;
        method: 'cash' | 'card' | 'e_wallet';
    }) => {
        const response = await api.post(`/orders/${orderId}/payments/`, paymentData);
        return response.data;
    },

    // Helper function: Chuyển đổi dữ liệu từ API thành format frontend
    transformOrderFromAPI: (apiOrder: any): Order => {
        return {
            id: apiOrder.id,
            orderNumber: `ORD-${apiOrder.id.toString().padStart(3, '0')}`,
            tableId: apiOrder.table,
            tableName: apiOrder.table_name || `Bàn ${apiOrder.table}`,
            floorId: apiOrder.table_info?.floor || 1,
            floorName: `Tầng ${apiOrder.table_info?.floor || 1}`,
            customerName: apiOrder.user_name || 'Khách vãng lai',
            items: apiOrder.order_items?.map((item: any): OrderItem => {
                // Simple 1:1 status mapping
                let frontendStatus: OrderItem["status"];
                switch (item.status) {
                    case 'ordered':
                        frontendStatus = 'pending';
                        break;
                    case 'cooking':
                        frontendStatus = 'preparing';
                        break;
                    case 'done':
                        frontendStatus = 'ready';
                        break;
                    case 'served':
                        frontendStatus = 'served';
                        break;
                    default:
                        frontendStatus = 'pending';
                }

                return {
                    id: item.id || item.menu_item,
                    menuItemId: item.menu_item,
                    menuItemName: item.menu_item_name,
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.price_each || item.menu_item_price),
                    totalPrice: parseFloat(item.subtotal || (item.quantity * parseFloat(item.price_each || item.menu_item_price))),
                    status: frontendStatus,
                    specialInstructions: item.note,
                };
            }) || [],
            status: apiOrder.status === 'paid' ? 'completed' :
                apiOrder.status === 'unpaid' ? 'active' :
                    apiOrder.status,
            totalAmount: parseFloat(apiOrder.total_amount),
            createdAt: apiOrder.created_at,
            updatedAt: apiOrder.updated_at || apiOrder.created_at,
            notes: apiOrder.note,
        };
    },

    // Helper function: Chuyển đổi filter frontend thành API params
    transformFiltersToAPI: (filters: any) => {
        return {
            table: filters.tableId,
            status: filters.status === 'active' ? 'unpaid' :
                filters.status === 'completed' ? 'paid' :
                    filters.status,
            floor: filters.floorId,
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
            table_name: filters.search,
        };
    }
};

export default ordersService;