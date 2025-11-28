import api from "./api";
import type { Order, OrderItem } from "../types/restaurant";

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
    }>("/orders/", orderData);
  },

  // Cập nhật trạng thái món ăn
  updateOrderItemStatus: (
    itemId: number,
    status: "ordered" | "cooking" | "done" | "cancelled"
  ) => {
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
  updateOrderItems: (
    orderId: number,
    items: Array<{
      menu_item: number;
      quantity: number;
      note?: string;
    }>
  ) => {
    return api.patch<{
      success: boolean;
      data: Order;
      message?: string;
    }>(`/orders/${orderId}/items/`, items);
  },

  // Tạo thanh toán
  createPayment: (
    orderId: number,
    paymentData: {
      amount: number;
      discount?: number;
      tax?: number;
      method: "cash" | "card" | "e_wallet";
    }
  ) => {
    return api.post<{
      success: boolean;
      data: any;
      message?: string;
    }>(`/orders/${orderId}/payments/`, paymentData);
  },

  // Tạo thanh toán MoMo
  createMoMoPayment: (orderId: number) => {
    return api.post<{
      success: boolean;
      data: {
        payment_url: string;
        qr_code_url: string;
        deep_link: string;
        request_id: string;
        order_id: string;
        amount: number;
      };
      message?: string;
    }>(`/orders/${orderId}/payments/momo/`);
  },

  // Kiểm tra trạng thái thanh toán MoMo
  checkMoMoPaymentStatus: (orderId: number) => {
    return api.get<{
      success: boolean;
      data: {
        status: "paid" | "unpaid";
        paid_at?: string;
      };
      message?: string;
    }>(`/orders/${orderId}/payments/momo/status/`);
  },

  // Trigger MoMo callback thủ công (cho development/đồ án)
  triggerMoMoCallback: (
    orderId: string,
    amount: number,
    resultCode: number
  ) => {
    return api.post<{
      success: boolean;
      message: string;
    }>("/payments/momo/trigger-callback/", {
      orderId,
      amount,
      resultCode,
    });
  },
};
