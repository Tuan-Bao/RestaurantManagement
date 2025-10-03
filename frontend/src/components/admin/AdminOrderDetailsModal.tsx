import React from "react";
import { createPortal } from "react-dom";
import type { Order, OrderItem } from "../../types/order";

interface AdminOrderDetailsModalProps {
    order: Order;
    show: boolean;
    onClose: () => void;
    onItemStatusChange?: (itemId: number, status: 'ordered' | 'cooking' | 'done' | 'cancelled') => void;
}

const AdminOrderDetailsModal: React.FC<AdminOrderDetailsModalProps> = ({
    order,
    show,
    onClose,
    onItemStatusChange,
}) => {
    if (!show) return null;

    const getStatusBadge = (backendStatus?: string) => {
        const statusConfig: { [key: string]: { color: string; text: string; icon: string } } = {
            ordered: { color: "secondary", text: "Chờ xử lý", icon: "bi-clock" },
            cooking: { color: "warning", text: "Đang nấu", icon: "bi-hourglass-split" },
            done: { color: "success", text: "Hoàn thành", icon: "bi-check-circle-fill" },
            cancelled: { color: "danger", text: "Đã hủy", icon: "bi-x-circle" },
        };
        return statusConfig[backendStatus || 'ordered'] || statusConfig.ordered;
    };

    const getOrderStatusBadge = (status: Order["status"]) => {
        const statusConfig = {
            active: {
                color: "success",
                text: "Đang hoạt động",
                icon: "bi-play-circle",
            },
            completed: {
                color: "primary",
                text: "Hoàn thành",
                icon: "bi-check-circle-fill",
            },
            cancelled: { color: "danger", text: "Đã hủy", icon: "bi-x-circle" },
        };
        return statusConfig[status];
    };

    const orderStatusInfo = getOrderStatusBadge(order.status);
    const createdAt = new Date(order.createdAt).toLocaleString("vi-VN");

    return createPortal(
        <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-receipt me-2"></i>
                            Chi tiết đơn hàng #{order.orderNumber}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            {/* Order Info */}
                            <div className="col-md-6">
                                <div className="card mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Thông tin đơn hàng
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-6">
                                                <strong>Số đơn:</strong>
                                                <div className="mb-2">{order.orderNumber}</div>
                                            </div>
                                            <div className="col-6">
                                                <strong>Trạng thái:</strong>
                                                <div className="mb-2">
                                                    <span className={`badge bg-${orderStatusInfo.color}`}>
                                                        <i className={`${orderStatusInfo.icon} me-1`}></i>
                                                        {orderStatusInfo.text}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <strong>Bàn:</strong>
                                                <div className="mb-2">{order.tableName} ({order.floorName})</div>
                                            </div>
                                            <div className="col-6">
                                                <strong>Thời gian đặt:</strong>
                                                <div className="mb-2">{createdAt}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="col-md-6">
                                <div className="card mb-3">
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="bi bi-calculator me-2"></i>
                                            Thống kê đơn hàng
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center">
                                            <div className="col-4">
                                                <div className="border-end">
                                                    <h4 className="text-primary mb-1">{(order.items || []).length}</h4>
                                                    <small className="text-muted">Món</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="border-end">
                                                    <h4 className="text-success mb-1">
                                                        {(order.items || []).reduce((sum, item) => sum + item.quantity, 0)}
                                                    </h4>
                                                    <small className="text-muted">Số lượng</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <h4 className="text-warning mb-1">
                                                    {order.totalAmount.toLocaleString("vi-VN")}đ
                                                </h4>
                                                <small className="text-muted">Tổng tiền</small>
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="row">
                                            <div className="col-6">
                                                <strong>Hoàn thành:</strong>
                                                <div className="text-success">
                                                    {(order.items || []).filter(item => (item as any)?.backendStatus === "done").length} món
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <strong>Đang nấu:</strong>
                                                <div className="text-warning">
                                                    {(order.items || []).filter(item => (item as any)?.backendStatus === "cooking").length} món
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">
                                    <i className="bi bi-list me-2"></i>
                                    Chi tiết món ăn ({(order.items || []).length} món)
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Món ăn</th>
                                                <th className="text-center">SL</th>
                                                <th className="text-end">Đơn giá</th>
                                                <th className="text-end">Thành tiền</th>
                                                <th className="text-center">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(order.items || []).map((item) => {
                                                const backendStatus = (item as any)?.backendStatus || 'ordered';
                                                const statusInfo = getStatusBadge(backendStatus);
                                                return (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="fw-bold">{item.menuItemName}</div>
                                                            <small className="text-muted">ID: {item.menuItemId}</small>
                                                        </td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="text-end">{item.unitPrice.toLocaleString("vi-VN")}đ</td>
                                                        <td className="text-end fw-bold text-primary">
                                                            {item.totalPrice.toLocaleString("vi-VN")}đ
                                                        </td>
                                                        <td className="text-center">
                                                            {onItemStatusChange && order.status === 'active' ? (
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={backendStatus}
                                                                    onChange={(e) => onItemStatusChange(item.id, e.target.value as 'ordered' | 'cooking' | 'done' | 'cancelled')}
                                                                    style={{ minWidth: '120px' }}
                                                                >
                                                                    <option value="ordered">Chờ xử lý</option>
                                                                    <option value="cooking">Đang nấu</option>
                                                                    <option value="done">Hoàn thành</option>
                                                                    <option value="cancelled">Đã hủy</option>
                                                                </select>
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
                                        <tfoot className="table-light">
                                            <tr>
                                                <th colSpan={3}>Tổng cộng</th>
                                                <th className="text-end">{order.totalAmount.toLocaleString("vi-VN")}đ</th>
                                                <th></th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-outline-primary">
                            <i className="bi bi-printer me-1"></i>
                            In hóa đơn
                        </button>
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

export default AdminOrderDetailsModal;