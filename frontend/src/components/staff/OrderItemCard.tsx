import React from "react";
import type { OrderItem } from "../../types/order";

interface OrderItemCardProps {
  item: OrderItem;
  onStatusChange: (itemId: number, status: OrderItem["status"]) => void;
  onItemDelete: (itemId: number) => void;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({
  item,
  onStatusChange,
  onItemDelete,
}) => {
  const getStatusBadge = (status: OrderItem["status"]) => {
    const statusConfig = {
      pending: { color: "secondary", text: "Chờ xử lý", icon: "bi-clock" },
      preparing: {
        color: "warning",
        text: "Đang làm",
        icon: "bi-hourglass-split",
      },
      ready: { color: "success", text: "Sẵn sàng", icon: "bi-check-circle" },
      served: {
        color: "primary",
        text: "Đã phục vụ",
        icon: "bi-check-circle-fill",
      },
    };
    return statusConfig[status];
  };

  const statusInfo = getStatusBadge(item.status);

  const getNextStatus = (
    currentStatus: OrderItem["status"]
  ): OrderItem["status"] | null => {
    switch (currentStatus) {
      case "pending":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "served";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(item.status);

  return (
    <div className="card mb-2 order-item-card">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold">{item.menuItemName}</h6>
            <div className="d-flex align-items-center gap-3 mb-2">
              <small className="text-muted">
                <i className="bi bi-hash me-1"></i>
                SL: {item.quantity}
              </small>
              <small className="text-muted">
                <i className="bi bi-currency-dollar me-1"></i>
                {item.unitPrice.toLocaleString("vi-VN")}đ
              </small>
              <small className="fw-bold text-primary">
                <i className="bi bi-receipt me-1"></i>
                {item.totalPrice.toLocaleString("vi-VN")}đ
              </small>
            </div>

            {item.specialInstructions && (
              <div className="alert alert-info py-2 mb-2">
                <i className="bi bi-chat-quote me-2"></i>
                <small>
                  <strong>Ghi chú:</strong> {item.specialInstructions}
                </small>
              </div>
            )}
          </div>

          <div className="ms-3 text-end">
            <span className={`badge bg-${statusInfo.color} mb-2`}>
              <i className={`${statusInfo.icon} me-1`}></i>
              {statusInfo.text}
            </span>

            {item.estimatedTime && item.status === "preparing" && (
              <div>
                <small className="text-warning d-block">
                  <i className="bi bi-clock me-1"></i>~{item.estimatedTime} phút
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-3">
          {nextStatus && (
            <button
              className={`btn btn-sm btn-${getStatusBadge(nextStatus).color}`}
              onClick={() => onStatusChange(item.id, nextStatus)}
            >
              <i className={`${getStatusBadge(nextStatus).icon} me-1`}></i>
              {nextStatus === "preparing" && "Bắt đầu làm"}
              {nextStatus === "ready" && "Hoàn thành"}
              {nextStatus === "served" && "Đã phục vụ"}
            </button>
          )}

          {item.status === "pending" && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xóa món "${item.menuItemName}" khỏi đơn hàng?`)) {
                  onItemDelete(item.id);
                }
              }}
            >
              <i className="bi bi-trash me-1"></i>
              Xóa món
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItemCard;
