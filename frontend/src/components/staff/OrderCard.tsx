import React, { useState } from "react";
import type { Order, OrderItem } from "../../types/order";
import OrderItemCard from "./OrderItemCard";

interface OrderCardProps {
  order: Order;
  onItemStatusChange: (
    orderId: number,
    itemId: number,
    status: OrderItem["status"]
  ) => void;
  onOrderStatusChange: (orderId: number, status: Order["status"]) => void;
  onItemDelete: (orderId: number, itemId: number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onItemStatusChange,
  onOrderStatusChange,
  onItemDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getOrderProgress = () => {
    const totalItems = order.items.length;
    const servedItems = order.items.filter(
      item => item.status === "served"
    ).length;
    const readyItems = order.items.filter(
      item => item.status === "ready"
    ).length;
    const preparingItems = order.items.filter(
      item => item.status === "preparing"
    ).length;
    const pendingItems = order.items.filter(
      item => item.status === "pending"
    ).length;

    return {
      totalItems,
      servedItems,
      readyItems,
      preparingItems,
      pendingItems,
    };
  };

  const progress = getOrderProgress();
  const progressPercentage = (progress.servedItems / progress.totalItems) * 100;
  const statusInfo = getOrderStatusBadge(order.status);

  const handleItemStatusChange = (
    itemId: number,
    status: OrderItem["status"]
  ) => {
    onItemStatusChange(order.id, itemId, status);
  };

  const handleItemDelete = (itemId: number) => {
    onItemDelete(order.id, itemId);
  };

  const getTimeInfo = () => {
    const createdTime = new Date(order.createdAt);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - createdTime.getTime()) / (1000 * 60)
    );

    return {
      elapsed: diffMinutes,
      createdAt: createdTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      estimated: order.estimatedCompletionTime
        ? new Date(order.estimatedCompletionTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
        : null,
    };
  };

  const timeInfo = getTimeInfo();

  return (
    <div className="card mb-3 order-card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <h6 className="mb-0 fw-bold">
              <i className="bi bi-receipt me-2"></i>
              {order.orderNumber}
            </h6>
            <span className={`badge bg-${statusInfo.color}`}>
              <i className={`${statusInfo.icon} me-1`}></i>
              {statusInfo.text}
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <small className="text-muted">
              <i className="bi bi-grid-3x3 me-1"></i>
              {order.tableName} ({order.floorName})
            </small>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <i
                className={`bi bi-chevron-${isExpanded ? "up" : "down"} me-1`}
              ></i>
              {isExpanded ? "Thu gọn" : "Chi tiết"}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="fw-bold">Tiến độ đơn hàng</small>
            <small className="text-muted">
              {progress.servedItems}/{progress.totalItems} món đã phục vụ
            </small>
          </div>
          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Status Summary */}
          <div className="d-flex gap-3 mt-2">
            {progress.pendingItems > 0 && (
              <small className="badge bg-secondary">
                {progress.pendingItems} chờ xử lý
              </small>
            )}
            {progress.preparingItems > 0 && (
              <small className="badge bg-warning">
                {progress.preparingItems} đang làm
              </small>
            )}
            {progress.readyItems > 0 && (
              <small className="badge bg-success">
                {progress.readyItems} sẵn sàng
              </small>
            )}
          </div>
        </div>

        {/* Time Info */}
        <div className="row mt-3">
          <div className="col-sm-4">
            <small className="text-muted d-block">Thời gian đặt</small>
            <small className="fw-bold">{timeInfo.createdAt}</small>
          </div>
          <div className="col-sm-4">
            <small className="text-muted d-block">Đã trôi qua</small>
            <small className="fw-bold text-warning">
              {timeInfo.elapsed} phút
            </small>
          </div>
          <div className="col-sm-4">
            <small className="text-muted d-block">Dự kiến hoàn thành</small>
            <small className="fw-bold text-info">
              {timeInfo.estimated || "Chưa xác định"}
            </small>
          </div>
        </div>

        {/* Customer & Total */}
        <div className="row mt-3">
          <div className="col-sm-6">
            {order.customerName && (
              <>
                <small className="text-muted d-block">Khách hàng</small>
                <small className="fw-bold">
                  <i className="bi bi-person me-1"></i>
                  {order.customerName}
                </small>
              </>
            )}
          </div>
          <div className="col-sm-6 text-end">
            <small className="text-muted d-block">Tổng tiền</small>
            <strong className="text-primary fs-6">
              {order.totalAmount.toLocaleString("vi-VN")}đ
            </strong>
          </div>
        </div>

        {order.notes && (
          <div className="alert alert-info mt-3 mb-0 py-2">
            <i className="bi bi-info-circle me-2"></i>
            <small>
              <strong>Ghi chú đơn hàng:</strong> {order.notes}
            </small>
          </div>
        )}
      </div>

      {/* Expandable Items List */}
      {isExpanded && (
        <div className="card-body">
          <h6 className="mb-3">
            <i className="bi bi-list me-2"></i>
            Chi tiết món ăn ({order.items.length} món)
          </h6>

          {order.items.map(item => (
            <OrderItemCard
              key={item.id}
              item={item}
              onStatusChange={handleItemStatusChange}
              onItemDelete={handleItemDelete}
            />
          ))}

          {/* Order Actions */}
          {order.status === "active" && (
            <div className="border-top pt-3 mt-3">
              <div className="d-flex gap-2">
                {progress.servedItems === progress.totalItems && (
                  <button
                    className="btn btn-primary"
                    onClick={() => onOrderStatusChange(order.id, "completed")}
                  >
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Hoàn thành đơn hàng
                  </button>
                )}

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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
