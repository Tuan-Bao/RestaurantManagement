import React from "react";

export interface Table {
  id: number;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentGuests?: number;
  reservedAt?: string;
  estimatedDuration?: number; // in minutes
}

interface TableCardProps {
  table: Table;
  onSelect: (table: Table) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onSelect }) => {
  const getStatusBadge = (status: Table["status"]) => {
    const statusConfig = {
      available: { color: "success", text: "Trống", icon: "bi-check-circle" },
      occupied: { color: "danger", text: "Có khách", icon: "bi-person-fill" },
      reserved: { color: "warning", text: "Đã đặt", icon: "bi-clock" },
      cleaning: {
        color: "secondary",
        text: "Dọn dẹp",
        icon: "bi-arrow-repeat",
      },
    };

    const config = statusConfig[status];

    return (
      <span className={`badge bg-${config.color} mb-2`}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const getCardClass = (status: Table["status"]) => {
    const baseClass = "card h-100 table-card";
    switch (status) {
      case "available":
        return `${baseClass} border-success`;
      case "occupied":
        return `${baseClass} border-danger`;
      case "reserved":
        return `${baseClass} border-warning`;
      case "cleaning":
        return `${baseClass} border-secondary`;
      default:
        return baseClass;
    }
  };

  return (
    <div
      className={getCardClass(table.status)}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect(table)}
    >
      <div className="card-body text-center">
        {getStatusBadge(table.status)}

        <h5 className="card-title">
          <i className="bi bi-grid-3x3 me-2"></i>
          {table.name}
        </h5>

        <p className="card-text">
          <small className="text-muted">
            <i className="bi bi-people me-1"></i>
            {table.currentGuests || 0}/{table.capacity} chỗ
          </small>
        </p>

        {table.status === "occupied" && table.estimatedDuration && (
          <div className="mt-2">
            <small className="text-info">
              <i className="bi bi-clock me-1"></i>
              Còn ~{table.estimatedDuration} phút
            </small>
          </div>
        )}

        {table.status === "reserved" && table.reservedAt && (
          <div className="mt-2">
            <small className="text-warning">
              <i className="bi bi-calendar me-1"></i>
              {new Date(table.reservedAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
        )}

        <div className="mt-3">
          <button
            className={`btn btn-sm ${
              table.status === "available"
                ? "btn-success"
                : "btn-outline-primary"
            }`}
            onClick={e => {
              e.stopPropagation();
              onSelect(table);
            }}
          >
            {table.status === "available" ? (
              <>
                <i className="bi bi-plus me-1"></i>
                Nhận bàn
              </>
            ) : (
              <>
                <i className="bi bi-eye me-1"></i>
                Xem chi tiết
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
