import React from "react";
import { createPortal } from "react-dom";
import type { Order, OrderItem } from "../../types/order";
import OrderItemCard from "./OrderItemCard";

interface OrderDetailsModalProps {
    order: Order;
    show: boolean;
    onClose: () => void;
    onItemStatusChange: (
        orderId: number,
        itemId: number,
        status: OrderItem["status"]
    ) => void;
    onOrderStatusChange: (orderId: number, status: Order["status"]) => void;
    onItemDelete: (orderId: number, itemId: number) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    order,
    show,
    onClose,
    onItemStatusChange,
    onOrderStatusChange,
    onItemDelete,
}) => {
    if (!show) return null;

    const handleItemStatusChange = (
        itemId: number,
        status: OrderItem["status"]
    ) => {
        onItemStatusChange(order.id, itemId, status);
    };

    const handleItemDelete = (itemId: number) => {
        onItemDelete(order.id, itemId);
    };

    return createPortal(
        <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Chi tiết đơn hàng #{order.orderNumber}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <strong>Bàn:</strong> {order.tableName} ({order.floorName})
                        </div>
                        <div className="mb-3">
                            <strong>Thời gian đặt:</strong> {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="mb-3">
                            <strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString("vi-VN")}đ
                        </div>
                        <h6 className="mb-3">Món ăn ({order.items.length} món)</h6>
                        {order.items.map(item => (
                            <OrderItemCard
                                key={item.id}
                                item={item}
                                onStatusChange={handleItemStatusChange}
                                onItemDelete={handleItemDelete}
                            />
                        ))}
                    </div>
                    <div className="modal-footer">
                        {order.status === "active" && (
                            <>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => onOrderStatusChange(order.id, "completed")}
                                    disabled={order.items.some(item => item.status !== "served")}
                                >
                                    <i className="bi bi-check-circle-fill me-1"></i>
                                    Hoàn thành đơn hàng
                                </button>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={() => {
                                        if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                                            onOrderStatusChange(order.id, "cancelled");
                                        }
                                    }}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Hủy đơn hàng
                                </button>
                                <button className="btn btn-outline-success">
                                    <i className="bi bi-credit-card me-1"></i>
                                    Xác nhận thanh toán
                                </button>
                            </>
                        )}
                        <button className="btn btn-secondary" onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OrderDetailsModal;
