import React from 'react';
import type { Table } from '../../types/restaurant';

interface TableCardProps {
  table: Table;
  onSelect: (table: Table) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onSelect }) => {
  const getStatusBadge = (status: Table['status']) => {
    const statusConfig = {
      available: { 
        color: 'success', 
        text: 'Trống', 
        icon: 'bi-check-circle',
        bgClass: 'border-success'
      },
      unavailable: { 
        color: 'danger', 
        text: 'Đang phục vụ', 
        icon: 'bi-person-fill',
        bgClass: 'border-danger'
      },
    };

    const config = statusConfig[status] || statusConfig.available;
    return { ...config };
  };

  const statusInfo = getStatusBadge(table.status);

  return (
    <div
      className={`card h-100 table-card ${statusInfo.bgClass}`}
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect(table)}
    >
      <div className="card-body text-center p-3">
        <span className={`badge bg-${statusInfo.color} mb-2`}>
          <i className={`${statusInfo.icon} me-1`}></i>
          {statusInfo.text}
        </span>

        <h6 className="card-title mb-2">
          <i className="bi bi-grid-3x3 me-1"></i>
          {table.name}
        </h6>

        <div className="text-muted small">
          <div>
            <i className="bi bi-building me-1"></i>
            Tầng {table.floor}
          </div>
        </div>

        <div className="mt-3">
          <button
            className={`btn btn-sm w-100 ${
              table.status === 'available'
                ? 'btn-success'
                : 'btn-outline-primary'
            }`}
            onClick={e => {
              e.stopPropagation();
              onSelect(table);
            }}
          >
            {table.status === 'available' ? (
              <>
                <i className="bi bi-plus me-1"></i>
                Mở bàn
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