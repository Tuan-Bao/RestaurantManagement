import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import type { Floor, Order } from "../../types/order";

const AdminOrders: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState<number>(0); // 0 = all floors
  const [floors, setFloors] = useState<Floor[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sortBy: "newest",
    dateRange: "today",
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockFloors: Floor[] = [
      {
        id: 1,
        name: "Tầng 1",
        orders: [
          {
            id: 1,
            orderNumber: "ORD-001",
            tableId: 1,
            tableName: "Bàn 1",
            floorId: 1,
            floorName: "Tầng 1",
            customerName: "Nguyễn Văn A",
            status: "active",
            totalAmount: 450000,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            notes: "Khách yêu cầu ít cay",
            estimatedCompletionTime: new Date(
              Date.now() + 15 * 60 * 1000
            ).toISOString(),
            items: [
              {
                id: 1,
                menuItemId: 101,
                menuItemName: "Phở bò đặc biệt",
                quantity: 2,
                unitPrice: 80000,
                totalPrice: 160000,
                status: "ready",
                estimatedTime: 5,
              },
              {
                id: 2,
                menuItemId: 102,
                menuItemName: "Bánh mì thịt nướng",
                quantity: 1,
                unitPrice: 35000,
                totalPrice: 35000,
                status: "preparing",
                specialInstructions: "Không rau thơm",
                estimatedTime: 10,
              },
            ],
          },
          {
            id: 2,
            orderNumber: "ORD-002",
            tableId: 3,
            tableName: "Bàn 3",
            floorId: 1,
            floorName: "Tầng 1",
            customerName: "Trần Thị B",
            status: "completed",
            totalAmount: 280000,
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            items: [
              {
                id: 5,
                menuItemId: 105,
                menuItemName: "Bún bò Huế",
                quantity: 2,
                unitPrice: 70000,
                totalPrice: 140000,
                status: "served",
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "Tầng 2",
        orders: [
          {
            id: 3,
            orderNumber: "ORD-003",
            tableId: 9,
            tableName: "Bàn 9",
            floorId: 2,
            floorName: "Tầng 2",
            customerName: "Lê Văn C",
            status: "cancelled",
            totalAmount: 650000,
            createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            notes: "Khách hủy do chờ quá lâu",
            items: [
              {
                id: 8,
                menuItemId: 108,
                menuItemName: "Lẩu thái hải sản",
                quantity: 1,
                unitPrice: 350000,
                totalPrice: 350000,
                status: "pending",
                estimatedTime: 25,
              },
            ],
          },
        ],
      },
    ];
    setFloors(mockFloors);
  }, []);

  const getCurrentOrders = useCallback(() => {
    if (activeFloor === 0) {
      return floors.flatMap(floor => floor.orders);
    }
    return floors.find(floor => floor.id === activeFloor)?.orders || [];
  }, [floors, activeFloor]);

  const applyFilters = useCallback(() => {
    let filtered = getCurrentOrders();

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filter by search
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
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

    // Filter by date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filters.dateRange === "today") {
      filtered = filtered.filter(order => new Date(order.createdAt) >= today);
    } else if (filters.dateRange === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo);
    } else if (filters.dateRange === "month") {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.createdAt) >= monthAgo);
    }

    // Sort orders
    if (filters.sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filters.sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (filters.sortBy === "amount-high") {
      filtered.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (filters.sortBy === "amount-low") {
      filtered.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    setFilteredOrders(filtered);
  }, [getCurrentOrders, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getOrderStats = () => {
    const allOrders = getCurrentOrders();
    const active = allOrders.filter(o => o.status === "active").length;
    const completed = allOrders.filter(o => o.status === "completed").length;
    const cancelled = allOrders.filter(o => o.status === "cancelled").length;
    const totalRevenue = allOrders
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { active, completed, cancelled, total: allOrders.length, totalRevenue };
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

  const stats = getOrderStats();

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-clipboard-data me-2"></i>
            Quản lý đơn hàng
          </h2>
          <p className="text-muted mb-0">
            Theo dõi và phân tích tất cả đơn hàng trong hệ thống
          </p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-download me-1"></i>
            Xuất báo cáo
          </button>
          <button className="btn btn-success">
            <i className="bi bi-plus me-1"></i>
            Tạo đơn mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
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
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
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
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
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
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
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
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Bộ lọc và tìm kiếm
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Tầng</label>
              <select
                className="form-select"
                value={activeFloor}
                onChange={e => setActiveFloor(Number(e.target.value))}
              >
                <option value={0}>Tất cả các tầng</option>
                {floors.map(floor => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={e => handleFilterChange("status", e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Khoảng thời gian</label>
              <select
                className="form-select"
                value={filters.dateRange}
                onChange={e => handleFilterChange("dateRange", e.target.value)}
              >
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="all">Tất cả thời gian</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Sắp xếp theo</label>
              <select
                className="form-select"
                value={filters.sortBy}
                onChange={e => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="amount-high">Giá trị cao</option>
                <option value="amount-low">Giá trị thấp</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo số đơn, bàn, khách hàng, món ăn..."
                value={filters.search}
                onChange={e => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <i className="bi bi-list me-2"></i>
              Danh sách đơn hàng ({filteredOrders.length})
            </h6>
            <small className="text-muted">
              {activeFloor === 0
                ? "Tất cả các tầng"
                : floors.find(f => f.id === activeFloor)?.name}
            </small>
          </div>
        </div>
        <div className="card-body p-0">
          {filteredOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Số đơn</th>
                    <th>Bàn</th>
                    <th>Khách hàng</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Thời gian</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const statusInfo = getOrderStatusBadge(order.status);
                    const timeInfo = new Date(order.createdAt).toLocaleString("vi-VN");
                    
                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.orderNumber}</strong>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold">{order.tableName}</div>
                            <small className="text-muted">{order.floorName}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{order.customerName || "Khách lẻ"}</div>
                            <small className="text-muted">
                              {order.items.length} món
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${statusInfo.color}`}>
                            <i className={`${statusInfo.icon} me-1`}></i>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td>
                          <strong className="text-primary">
                            {order.totalAmount.toLocaleString("vi-VN")}đ
                          </strong>
                        </td>
                        <td>
                          <small>{timeInfo}</small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Xem chi tiết"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              title="In hóa đơn"
                            >
                              <i className="bi bi-printer"></i>
                            </button>
                            {order.status === "active" && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Hủy đơn"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Không có đơn hàng nào</h5>
              <p className="text-muted">
                Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;