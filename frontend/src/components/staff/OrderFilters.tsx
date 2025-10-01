import React from "react";

interface OrderFiltersProps {
  filters: {
    status: string;
    search: string;
    floor: number;
  };
  onFilterChange: (key: string, value: any) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={e => onFilterChange("status", e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="ready">Sẵn sàng</option>
              <option value="served">Đã phục vụ</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Tầng</label>
            <select
              className="form-select"
              value={filters.floor}
              onChange={e => onFilterChange("floor", parseInt(e.target.value))}
            >
              <option value={0}>Tất cả tầng</option>
              <option value={1}>Tầng 1</option>
              <option value={2}>Tầng 2</option>
              <option value={3}>Tầng 3</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Tìm kiếm</label>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo số đơn, bàn, khách hàng..."
              value={filters.search}
              onChange={e => onFilterChange("search", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;