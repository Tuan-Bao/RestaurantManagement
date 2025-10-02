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
  const getStatusBadge = (backendStatus?: string) => {
    // Map backend status to display info
    const statusConfig: { [key: string]: { color: string; text: string; icon: string } } = {
      ordered: { color: "secondary", text: "Chờ xử lý", icon: "bi-clock" },
      cooking: { color: "warning", text: "Đang nấu", icon: "bi-hourglass-split" },
      done: { color: "success", text: "Hoàn thành", icon: "bi-check-circle-fill" },
      cancelled: { color: "danger", text: "Đã hủy", icon: "bi-x-circle" },
    };

    return statusConfig[backendStatus || 'ordered'] || statusConfig.ordered;
  };

  // Get backend status or fallback to frontend status mapping
  const backendStatus = (item as any)?.backendStatus || 'ordered';
  const statusInfo = getStatusBadge(backendStatus);
  const isCancelled = backendStatus === 'cancelled';

  const getNextBackendStatus = (currentBackendStatus: string): string | null => {
    switch (currentBackendStatus) {
      case "ordered":
        return "cooking";
      case "cooking":
        return "done";
      default:
        return null;
    }
  };

  const nextBackendStatus = getNextBackendStatus(backendStatus);
  const nextStatusInfo = nextBackendStatus ? getStatusBadge(nextBackendStatus) : null;

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
            {isCancelled ? (
              <span className="badge bg-danger mb-2">
                <i className="bi bi-x-circle me-1"></i>
                Đã hủy
              </span>
            ) : (
              <span className={`badge bg-${statusInfo.color} mb-2`}>
                <i className={`${statusInfo.icon} me-1`}></i>
                {statusInfo.text}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-3">
          {!isCancelled && nextBackendStatus && nextStatusInfo && (
            <button
              className={`btn btn-sm btn-${nextStatusInfo.color}`}
              onClick={() => {
                console.log('Changing item status:', {
                  itemId: item.id,
                  from: backendStatus,
                  to: nextBackendStatus
                });
                // Map backend status to frontend status for API call
                const frontendStatus: OrderItem["status"] =
                  nextBackendStatus === "cooking" ? "preparing" :
                    nextBackendStatus === "done" ? "served" : "pending";
                onStatusChange(item.id, frontendStatus);
              }}
            >
              <i className={`${nextStatusInfo.icon} me-1`}></i>
              {nextBackendStatus === "cooking" && "Bắt đầu nấu"}
              {nextBackendStatus === "done" && "Hoàn thành"}
            </button>
          )}

          {!isCancelled && backendStatus === "ordered" && (
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

          {isCancelled && (
            <small className="text-muted">Món ăn này đã bị hủy</small>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItemCard;
