import api from './api';
import type { Order, OrderItem } from '../types/restaurant';

export const ordersApi = {
  // Lấy đơn hàng theo bàn
  getOrderByTable: (tableId: number) => {
    return api.get<{
      success: boolean;
      data: Order | null;
      message?: string;
    }>(`/orders/table/${tableId}/`);
  },

  // Tạo đơn hàng mới
  createOrder: (orderData: {
    table: number;
    items: Array<{
      menu_item: number;
      quantity: number;
      note?: string;
    }>;
  }) => {
    return api.post<{
      success: boolean;
      data: Order;
      message?: string;
    }>('/orders/', orderData);
  },

  // Cập nhật trạng thái món ăn 
  updateOrderItemStatus: (itemId: number, status: 'ordered' | 'cooking' | 'done' | 'cancel') => {
    return api.patch<{
      success: boolean;
      data: OrderItem;
      message?: string;
    }>(`/orders/items/${itemId}/status/`, { status });
  },

  // Xóa món ăn (chỉ khi status = ordered)
  deleteOrderItem: (itemId: number) => {
    return api.delete<{
      success: boolean;
      message?: string;
    }>(`/orders/items/${itemId}/`);
  },

  // Cập nhật món trong đơn hàng - GỬI TRỰC TIẾP ARRAY
  updateOrderItems: (orderId: number, items: Array<{
    menu_item: number;  
    quantity: number;
    note?: string;
  }>) => {
    return api.patch<{
      success: boolean;
      data: Order;
      message?: string;
    }>(`/orders/${orderId}/items/`, items); 
  },

  // Tạo thanh toán
  createPayment: (orderId: number, paymentData: {
    amount: number;
    discount?: number;
    tax?: number;
    method: 'cash' | 'card' | 'e_wallet';  
  }) => {
    return api.post<{
      success: boolean;
      data: any;
      message?: string;
    }>(`/orders/${orderId}/payments/`, paymentData);
  }
};