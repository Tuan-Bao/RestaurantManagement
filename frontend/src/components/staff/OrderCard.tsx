import React, { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
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
  onViewDetails?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onItemStatusChange,
  onOrderStatusChange,
  onItemDelete,
  onViewDetails,
}) => {
  const [showModal, setShowModal] = useState(false);

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
              onClick={() => onViewDetails?.(order)}
            >
              <i className="bi bi-eye me-1"></i>
              Chi tiết
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
        </div>

        {/* Customer & Total */}
        <div className="row mt-3">
          <div className="col-sm-6">
          </div>
          <div className="col-sm-6 text-end">
            <small className="text-muted d-block">Tổng tiền</small>
            <strong className="text-primary fs-6">
              {order.totalAmount.toLocaleString("vi-VN")}đ
            </strong>
          </div>
        </div>
      </div>

      {/* Order Details Modal Popup */}
      <OrderDetailsModal
        order={order}
        show={showModal}
        onClose={() => setShowModal(false)}
        onItemStatusChange={onItemStatusChange}
        onOrderStatusChange={onOrderStatusChange}
        onItemDelete={onItemDelete}
      />
    </div>
  );
};

export default OrderCard;
