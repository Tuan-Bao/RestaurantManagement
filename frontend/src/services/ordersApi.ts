import api from './api';
import type { Order, OrderItem, Floor } from '../types/order';

// API service for orders
export const ordersApiService = {
    // Lấy tất cả đơn hàng với pagination và filter
    getAllOrders: async (params?: {
        status?: string;
        search?: string;
        floor?: number;
        date_from?: string;
        date_to?: string;
        page?: number;
        page_size?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.floor && params.floor !== 0) queryParams.append('floor', params.floor.toString());
        if (params?.date_from) queryParams.append('date_from', params.date_from);
        if (params?.date_to) queryParams.append('date_to', params.date_to);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

        const response = await api.get<{
            success: boolean;
            data: any[];  // API returns data as direct array
            message?: string;
        }>(`/orders/?${queryParams.toString()}`);

        return response;
    },

    // Lấy đơn hàng theo ID
    getOrderById: async (orderId: number) => {
        const response = await api.get<{
            success: boolean;
            data: any;
            message?: string;
        }>(`/orders/${orderId}/`);

        return response;
    },

    // Lấy đơn hàng theo bàn
    getOrderByTable: async (tableId: number) => {
        const response = await api.get<{
            success: boolean;
            data: any | null;
            message?: string;
        }>(`/orders/table/${tableId}/`);

        return response;
    },

    // Cập nhật trạng thái món ăn
    updateOrderItemStatus: async (itemId: number, status: 'ordered' | 'cooking' | 'done' | 'cancelled') => {
        const response = await api.patch<{
            success: boolean;
            data: any;
            message?: string;
        }>(`/orders/items/${itemId}/status/`, { status });

        return response;
    },

    // Hủy món ăn
    cancelOrderItem: async (itemId: number) => {
        const response = await api.patch<{
            success: boolean;
            message?: string;
        }>(`/orders/items/${itemId}/status/`, { status: 'cancelled' });

        return response;
    },

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (orderId: number, status: 'unpaid' | 'paid') => {
        const response = await api.patch<{
            success: boolean;
            data: any;
            message?: string;
        }>(`/orders/${orderId}/status/`, { status });

        return response;
    },

    // Lấy danh sách tầng và bàn
    getFloors: async () => {
        const response = await api.get<{
            success: boolean;
            data: Array<{
                floor: number;
                floor_name: string;
                tables: Array<{
                    id: number;
                    name: string;
                    status: string;
                }>;
            }>;
            message?: string;
        }>('/tables/floors/');

        return response;
    }
};

// Helper functions to transform backend data to frontend format
export const transformOrderData = (backendOrder: any): Order => {
    // Ensure order_items is always an array
    const orderItems = Array.isArray(backendOrder.order_items) ? backendOrder.order_items : [];

    return {
        id: backendOrder.id,
        orderNumber: `ORD-${backendOrder.id.toString().padStart(3, '0')}`,
        tableId: backendOrder.table || 0,
        tableName: backendOrder.table_name || 'N/A',
        floorId: backendOrder.table_floor || 0,
        floorName: `Tầng ${backendOrder.table_floor || 'N/A'}`,
        customerName: backendOrder.user_name || 'Khách vãng lai',
        status: mapBackendOrderStatus(backendOrder.status),
        totalAmount: parseFloat(backendOrder.total_amount || '0'),
        createdAt: backendOrder.created_at,
        updatedAt: backendOrder.updated_at,
        items: orderItems.map(transformOrderItemData),
        notes: orderItems.find((item: any) => item.note)?.note || undefined,
        estimatedCompletionTime: backendOrder.created_at
    };
};

export const transformOrderItemData = (backendItem: any): OrderItem => {
    return {
        id: backendItem.id,
        menuItemId: backendItem.menu_item || 0,
        menuItemName: backendItem.menu_item_name || 'N/A',
        quantity: backendItem.quantity || 0,
        unitPrice: parseFloat(backendItem.price_each || backendItem.menu_item_price || '0'),
        totalPrice: parseFloat(backendItem.subtotal || '0'),
        status: mapBackendItemStatus(backendItem.status),
        specialInstructions: backendItem.note || undefined,
        estimatedTime: undefined, // Backend doesn't have this field
        // Preserve backend status and ingredients data from backend
        ...(backendItem.status && { backendStatus: backendItem.status }),
        ...(backendItem.ingredients && { ingredients: backendItem.ingredients })
    } as any; // Use 'as any' to allow extra properties
};// Status mapping functions
const mapBackendOrderStatus = (backendStatus: string): Order['status'] => {
    switch (backendStatus) {
        case 'paid':
            return 'completed';
        case 'unpaid':
            return 'active';
        case 'cancelled':
            return 'cancelled';
        default:
            return 'active';
    }
};

const mapBackendItemStatus = (backendStatus: string): OrderItem['status'] => {
    switch (backendStatus) {
        case 'ordered':
            return 'pending';
        case 'cooking':
            return 'preparing';
        case 'done':
            return 'served'; // 'done' in backend means the dish is ready and served
        case 'cancelled':
            return 'served'; // Map cancelled to served to avoid type errors, but we check backendStatus for display
        default:
            return 'pending';
    }
};

export const transformFloorsData = (backendFloors: any[]): Floor[] => {
    const groupedOrders: { [key: number]: Order[] } = {};

    // Initialize floors with empty orders
    backendFloors.forEach(floorData => {
        groupedOrders[floorData.floor] = [];
    });

    return backendFloors.map(floorData => ({
        id: floorData.floor,
        name: floorData.floor_name,
        orders: groupedOrders[floorData.floor] || []
    }));
};