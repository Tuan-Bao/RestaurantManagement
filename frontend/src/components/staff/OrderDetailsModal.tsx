import React from "react";
import { createPortal } from "react-dom";
import type { Order, OrderItem } from "../../types/order";

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
}) => {
    if (!show) return null;

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

                        <h6 className="mb-3">Món ăn ({(order.items || []).length} món)</h6>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Tên món</th>
                                        <th>Số lượng</th>
                                        <th>Nguyên liệu/Ghi chú</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map(item => {
                                        const getStatusBadge = (backendStatus?: string) => {
                                            const statusConfig: { [key: string]: { color: string; text: string; icon: string } } = {
                                                ordered: { color: "secondary", text: "Chờ xử lý", icon: "bi-clock" },
                                                cooking: { color: "warning", text: "Đang nấu", icon: "bi-hourglass-split" },
                                                done: { color: "success", text: "Hoàn thành", icon: "bi-check-circle-fill" },
                                                cancelled: { color: "danger", text: "Đã hủy", icon: "bi-x-circle" },
                                            };
                                            return statusConfig[backendStatus || 'ordered'] || statusConfig.ordered;
                                        };

                                        const backendStatus = (item as any)?.backendStatus || 'ordered';
                                        const statusInfo = getStatusBadge(backendStatus);
                                        const isCancelled = backendStatus === 'cancelled';

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{item.menuItemName}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {item.unitPrice.toLocaleString("vi-VN")}đ
                                                    </small>
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                    {item.specialInstructions ? (
                                                        <div>
                                                            <span className="text-info">
                                                                <i className="bi bi-chat-quote me-1"></i>
                                                                {item.specialInstructions}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                    {/* Display ingredients if available */}
                                                    {(item as any).ingredients && (item as any).ingredients.length > 0 ? (
                                                        <div className="mt-1">
                                                            <small className="text-muted">
                                                                <i className="bi bi-basket me-1"></i>
                                                                <strong>Nguyên liệu:</strong>
                                                            </small>
                                                            <ul className="mb-0 ps-3" style={{ fontSize: '0.85rem' }}>
                                                                {(item as any).ingredients.map((ing: any, idx: number) => (
                                                                    <li key={idx} className="text-muted">
                                                                        {ing.name} ({ing.quantity_required} {ing.unit})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ) : (
                                                        !item.specialInstructions && (
                                                            <span className="text-muted">Không có</span>
                                                        )
                                                    )}
                                                </td>
                                                <td>
                                                    {isCancelled ? (
                                                        <span className="badge bg-danger">
                                                            <i className="bi bi-x-circle me-1"></i>
                                                            Đã hủy
                                                        </span>
                                                    ) : (
                                                        <span className={`badge bg-${statusInfo.color}`}>
                                                            <i className={`${statusInfo.icon} me-1`}></i>
                                                            {statusInfo.text}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {(!order.items || order.items.length === 0) && (
                            <div className="text-center py-4 text-muted">
                                <i className="bi bi-cart-x fs-2"></i>
                                <p className="mt-2">Chưa có món ăn nào</p>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
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
