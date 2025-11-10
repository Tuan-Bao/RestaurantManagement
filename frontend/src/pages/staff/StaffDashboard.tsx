import React, { useEffect, useState } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import {
  staffDashboardApi,
  type StaffStats,
  type ActiveOrder,
  type Alert,
} from "../../services/staffDashboard";
import Loading from "../../components/shared/Loading";

const StaffDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, alertsData] = await Promise.all([
        staffDashboardApi.getStats(),
        staffDashboardApi.getActiveOrders(),
        staffDashboardApi.getAlerts(),
      ]);

      setStats(statsData);
      setActiveOrders(ordersData);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading staff dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Auto refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getOrderStatusBadge = (status: string) => {
    const badges: { [key: string]: { class: string; text: string } } = {
      unpaid: { class: "bg-primary", text: "Mới" },
      pending: { class: "bg-warning", text: "Đang phục vụ" },
      paid: { class: "bg-success", text: "Đã thanh toán" },
    };
    return badges[status] || { class: "bg-secondary", text: status };
  };

  if (loading) {
    return (
      <StaffLayout>
        <Loading />
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="bi bi-house me-2"></i>
            Dashboard Nhân viên
          </h2>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">
                <i className="bi bi-grid-3x3"></i>
              </div>
              <h4 className="mb-1">{stats?.tables.occupied || 0}</h4>
              <small>Bàn đang phục vụ</small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">
                <i className="bi bi-cart-check"></i>
              </div>
              <h4 className="mb-1">{stats?.orders.today || 0}</h4>
              <small>Đơn hôm nay</small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">
                <i className="bi bi-clock"></i>
              </div>
              <h4 className="mb-1">{stats?.orders.pending || 0}</h4>
              <small>Đang chờ phục vụ</small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <div className="fs-1 mb-2">
                <i className="bi bi-currency-dollar"></i>
              </div>
              <h4 className="mb-1">
                {formatCurrency(stats?.revenue.today || 0)}
              </h4>
              <small>Doanh thu hôm nay</small>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-lightning me-2"></i>
                Thao tác nhanh
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="d-grid">
                    <button className="btn btn-outline-primary btn-lg">
                      <i className="bi bi-plus-circle d-block fs-2 mb-2"></i>
                      Tạo đơn mới
                    </button>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-grid">
                    <button className="btn btn-outline-success btn-lg">
                      <i className="bi bi-grid-3x3-gap d-block fs-2 mb-2"></i>
                      Xem tình trạng bàn
                    </button>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-grid">
                    <button className="btn btn-outline-info btn-lg">
                      <i className="bi bi-journal-text d-block fs-2 mb-2"></i>
                      Thực đơn
                    </button>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-grid">
                    <button className="btn btn-outline-warning btn-lg">
                      <i className="bi bi-box d-block fs-2 mb-2"></i>
                      Kiểm tra kho
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Orders */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">
                <i className="bi bi-list-check me-2"></i>
                Đơn hàng hiện tại
              </h6>
              <button
                className="btn btn-sm btn-primary"
                onClick={loadDashboardData}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Làm mới
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {activeOrders.length === 0 ? (
                  <div className="col-12 text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p>Không có đơn hàng đang hoạt động</p>
                  </div>
                ) : (
                  activeOrders.slice(0, 6).map(order => {
                    const statusBadge = getOrderStatusBadge(order.status);
                    const isLongWaiting = order.waiting_minutes > 15;
                    const cardBorderClass =
                      order.status === "unpaid"
                        ? "border-primary"
                        : "border-warning";

                    return (
                      <div className="col-md-6" key={order.id}>
                        <div className={`card ${cardBorderClass}`}>
                          <div
                            className={`card-header ${
                              order.status === "unpaid"
                                ? "bg-primary text-white"
                                : "bg-warning text-dark"
                            } d-flex justify-content-between`}
                          >
                            <span>
                              <i className="bi bi-grid-3x3 me-1"></i>
                              {order.table.name}
                            </span>
                            <span className={`badge ${statusBadge.class}`}>
                              {statusBadge.text}
                            </span>
                          </div>
                          <div className="card-body p-3">
                            <small className="text-muted">
                              Đơn #{order.id} -{" "}
                              {new Date(order.created_at).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                              {isLongWaiting && (
                                <span className="text-danger ms-2">
                                  <i className="bi bi-exclamation-triangle"></i>{" "}
                                  Chờ {order.waiting_minutes} phút
                                </span>
                              )}
                            </small>
                            <div className="mt-2">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <small className="d-block" key={idx}>
                                  • {item.quantity}x {item.menu_item_name} (
                                  {formatCurrency(item.price)})
                                </small>
                              ))}
                              {order.items.length > 3 && (
                                <small className="d-block text-muted">
                                  • +{order.items.length - 3} món khác...
                                </small>
                              )}
                            </div>
                            <div className="d-flex justify-content-between mt-3">
                              <strong>
                                {formatCurrency(order.total_amount)}
                              </strong>
                              <button className="btn btn-sm btn-success">
                                Xử lý
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Add New Order Card */}
                {activeOrders.length > 0 && (
                  <div className="col-md-6">
                    <div
                      className="card border-2 border-dashed h-100 d-flex align-items-center justify-content-center"
                      style={{ minHeight: "180px", cursor: "pointer" }}
                    >
                      <div className="text-center text-muted">
                        <i className="bi bi-plus-circle fs-1 mb-2"></i>
                        <p className="mb-0">Tạo đơn mới</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Cần chú ý
              </h6>
            </div>
            <div className="card-body">
              {alerts.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-check-circle fs-1 d-block mb-2"></i>
                  <small>Không có cảnh báo</small>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`alert alert-${alert.type} ${
                      index < alerts.length - 1 ? "mb-2" : ""
                    }`}
                  >
                    <small>
                      <i className={`bi bi-${alert.icon} me-1`}></i>
                      {alert.message}
                    </small>
                  </div>
                ))
              )}

              <hr />

              <h6 className="mb-3">
                <i className="bi bi-list-ul me-2"></i>
                Nhiệm vụ hôm nay
              </h6>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="task1"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="task1">
                  <small>Kiểm tra kho buổi sáng</small>
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="task2"
                />
                <label className="form-check-label" htmlFor="task2">
                  <small>Cập nhật menu ngày</small>
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="task3"
                />
                <label className="form-check-label" htmlFor="task3">
                  <small>Dọn dẹp khu vực bàn</small>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;
