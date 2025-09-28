import React, { useState } from "react";
import type { Order } from "../../types/order";

interface OrderFiltersProps {
  orders: Order[];
  onFilteredOrdersChange: (orders: Order[]) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  orders,
  onFilteredOrdersChange,
}) => {
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sortBy: "newest",
    timeRange: "today",
  });

  const applyFilters = (newFilters = filters) => {
    let filtered = [...orders];

    // Filter by status
    if (newFilters.status !== "all") {
      filtered = filtered.filter(order => order.status === newFilters.status);
    }

    // Filter by search (order number, table name, customer name)
    if (newFilters.search.trim()) {
      const searchLower = newFilters.search.toLowerCase().trim();
      filtered = filtered.filter(
        order =>
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.tableName.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.items.some(item =>
            item.menuItemName.toLowerCase().includes(searchLower)
          )
      );
    }

    // Filter by time range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (newFilters.timeRange === "today") {
      filtered = filtered.filter(order => new Date(order.createdAt) >= today);
    } else if (newFilters.timeRange === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo);
    }

    // Sort orders
    if (newFilters.sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (newFilters.sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (newFilters.sortBy === "amount-high") {
      filtered.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (newFilters.sortBy === "amount-low") {
      filtered.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    onFilteredOrdersChange(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Apply initial filters
  React.useEffect(() => {
    applyFilters();
  }, [orders]);

  const getOrderStats = () => {
    const active = orders.filter(o => o.status === "active").length;
    const completed = orders.filter(o => o.status === "completed").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { active, completed, cancelled, total: orders.length, totalRevenue };
  };

  const stats = getOrderStats();

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-funnel me-2"></i>
          Bộ lọc và thống kê đơn hàng
        </h6>
      </div>
      <div className="card-body">
        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded p-3 me-3">
                <i className="bi bi-receipt fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">{stats.total}</h5>
                <small className="text-muted">Tổng đơn hàng</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-success text-white rounded p-3 me-3">
                <i className="bi bi-play-circle fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">{stats.active}</h5>
                <small className="text-muted">Đang hoạt động</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-info text-white rounded p-3 me-3">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">{stats.completed}</h5>
                <small className="text-muted">Hoàn thành</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-warning text-white rounded p-3 me-3">
                <i className="bi bi-currency-dollar fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">
                  {stats.totalRevenue.toLocaleString("vi-VN")}đ
                </h5>
                <small className="text-muted">Doanh thu</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="row">
          <div className="col-md-3 mb-3">
            <label className="form-label">
              <i className="bi bi-flag me-1"></i>
              Trạng thái
            </label>
            <select
              className="form-select"
              value={filters.status}
              onChange={e => handleFilterChange("status", e.target.value)}
              aria-label="Trạng thái"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label className="form-label">
              <i className="bi bi-calendar me-1"></i>
              Thời gian
            </label>
            <select
              className="form-select"
              value={filters.timeRange}
              onChange={e => handleFilterChange("timeRange", e.target.value)}
              aria-label="Khoảng thời gian"
            >
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="all">Tất cả thời gian</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label className="form-label">
              <i className="bi bi-sort-down me-1"></i>
              Sắp xếp theo
            </label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={e => handleFilterChange("sortBy", e.target.value)}
              aria-label="Sắp xếp theo"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="amount-high">Giá trị cao</option>
              <option value="amount-low">Giá trị thấp</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label className="form-label">
              <i className="bi bi-search me-1"></i>
              Tìm kiếm
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Số đơn, bàn, khách hàng, món..."
              value={filters.search}
              onChange={e => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="d-flex flex-wrap gap-2">
          <button
            className={`btn btn-sm ${
              filters.status === "active"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() =>
              handleFilterChange(
                "status",
                filters.status === "active" ? "all" : "active"
              )
            }
          >
            <i className="bi bi-play-circle me-1"></i>
            Đang hoạt động ({stats.active})
          </button>

          <button
            className={`btn btn-sm ${
              filters.timeRange === "today"
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() =>
              handleFilterChange(
                "timeRange",
                filters.timeRange === "today" ? "all" : "today"
              )
            }
          >
            <i className="bi bi-calendar-today me-1"></i>
            Hôm nay
          </button>

          {(filters.status !== "all" ||
            filters.search ||
            filters.timeRange !== "today") && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                const resetFilters = {
                  status: "all",
                  search: "",
                  sortBy: "newest",
                  timeRange: "today",
                };
                setFilters(resetFilters);
                applyFilters(resetFilters);
              }}
            >
              <i className="bi bi-x-circle me-1"></i>
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
