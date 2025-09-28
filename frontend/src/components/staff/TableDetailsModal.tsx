import React from "react";
import type { Table } from "./TableCard";

interface TableDetailsModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: "occupy" | "reserve" | "clean" | "free") => void;
}

const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  table,
  isOpen,
  onClose,
  onAction,
}) => {
  if (!isOpen || !table) return null;

  const getStatusInfo = (status: Table["status"]) => {
    const statusConfig = {
      available: {
        color: "success",
        text: "Bàn trống",
        icon: "bi-check-circle",
      },
      occupied: {
        color: "danger",
        text: "Đang có khách",
        icon: "bi-person-fill",
      },
      reserved: { color: "warning", text: "Đã được đặt", icon: "bi-clock" },
      cleaning: {
        color: "secondary",
        text: "Đang dọn dẹp",
        icon: "bi-arrow-repeat",
      },
    };
    return statusConfig[status];
  };

  const statusInfo = getStatusInfo(table.status);

  const getAvailableActions = () => {
    switch (table.status) {
      case "available":
        return [
          {
            action: "occupy" as const,
            label: "Nhận bàn",
            color: "success",
            icon: "bi-person-plus",
          },
          {
            action: "reserve" as const,
            label: "Đặt bàn",
            color: "warning",
            icon: "bi-calendar-plus",
          },
        ];
      case "occupied":
        return [
          {
            action: "free" as const,
            label: "Trả bàn",
            color: "success",
            icon: "bi-check-circle",
          },
          {
            action: "clean" as const,
            label: "Dọn bàn",
            color: "secondary",
            icon: "bi-arrow-repeat",
          },
        ];
      case "reserved":
        return [
          {
            action: "occupy" as const,
            label: "Nhận bàn",
            color: "success",
            icon: "bi-person-plus",
          },
          {
            action: "free" as const,
            label: "Hủy đặt",
            color: "outline-danger",
            icon: "bi-x-circle",
          },
        ];
      case "cleaning":
        return [
          {
            action: "free" as const,
            label: "Hoàn thành",
            color: "success",
            icon: "bi-check-circle",
          },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-grid-3x3 me-2"></i>
                Chi tiết {table.name}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {/* Status Badge */}
              <div className="text-center mb-4">
                <span className={`badge bg-${statusInfo.color} fs-6 px-3 py-2`}>
                  <i className={`${statusInfo.icon} me-2`}></i>
                  {statusInfo.text}
                </span>
              </div>

              {/* Table Info */}
              <div className="row mb-4">
                <div className="col-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6 className="card-title">Sức chứa</h6>
                      <p className="card-text fs-5">
                        <i className="bi bi-people me-1"></i>
                        {table.capacity} người
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6 className="card-title">Hiện tại</h6>
                      <p className="card-text fs-5">
                        <i className="bi bi-person-fill me-1"></i>
                        {table.currentGuests || 0} khách
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Based on Status */}
              {table.status === "occupied" && table.estimatedDuration && (
                <div className="alert alert-info">
                  <i className="bi bi-clock me-2"></i>
                  <strong>Thời gian dự kiến:</strong> Còn khoảng{" "}
                  {table.estimatedDuration} phút
                </div>
              )}

              {table.status === "reserved" && table.reservedAt && (
                <div className="alert alert-warning">
                  <i className="bi bi-calendar me-2"></i>
                  <strong>Thời gian đặt:</strong>{" "}
                  {new Date(table.reservedAt).toLocaleString("vi-VN")}
                </div>
              )}

              {/* Quick Stats */}
              <div className="row text-center mb-4">
                <div className="col-4">
                  <small className="text-muted d-block">Bàn số</small>
                  <strong>{table.name}</strong>
                </div>
                <div className="col-4">
                  <small className="text-muted d-block">ID</small>
                  <strong>#{table.id}</strong>
                </div>
                <div className="col-4">
                  <small className="text-muted d-block">Trạng thái</small>
                  <strong className={`text-${statusInfo.color}`}>
                    {statusInfo.text}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Đóng
              </button>

              {getAvailableActions().map(actionConfig => (
                <button
                  key={actionConfig.action}
                  type="button"
                  className={`btn btn-${actionConfig.color}`}
                  onClick={() => {
                    onAction(actionConfig.action);
                    onClose();
                  }}
                >
                  <i className={`${actionConfig.icon} me-1`}></i>
                  {actionConfig.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default TableDetailsModal;
