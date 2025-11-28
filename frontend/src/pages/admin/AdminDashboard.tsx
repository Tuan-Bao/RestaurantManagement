import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { dashboardApi } from "../../services/dashboard";
import type {
  DashboardStats,
  RecentOrder,
  TopMenuItem,
  RevenueByDay,
  ExpensiveMenuItem,
  OrderHistory,
  PeakHour,
} from "../../services/dashboard";
import Loading from "../../components/shared/Loading";

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topItems, setTopItems] = useState<TopMenuItem[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueByDay[]>([]);
  const [expensiveItems, setExpensiveItems] = useState<ExpensiveMenuItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistory | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsRes,
        ordersRes,
        topItemsRes,
        revenueRes,
        expensiveRes,
        historyRes,
        peakRes,
      ] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentOrders(5),
        dashboardApi.getTopMenuItems(5, 30),
        dashboardApi.getRevenueByDay(7),
        dashboardApi.getMostExpensiveItems(5),
        dashboardApi.getOrderHistory(30),
        dashboardApi.getPeakHours(30),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data);
      }

      if (topItemsRes.data.success) {
        setTopItems(topItemsRes.data.data);
      }

      if (revenueRes.data.success) {
        setRevenueData(revenueRes.data.data);
      }

      if (expensiveRes.data.success) {
        setExpensiveItems(expensiveRes.data.data);
      }

      if (historyRes.data.success) {
        setOrderHistory(historyRes.data.data);
      }

      if (peakRes.data.success) {
        setPeakHours(peakRes.data.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="badge bg-success">Đã thanh toán</span>;
      case "unpaid":
        return <span className="badge bg-warning">Chưa thanh toán</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getChangeIcon = (percent: number) => {
    if (percent > 0) {
      return <i className="bi bi-arrow-up text-success"></i>;
    } else if (percent < 0) {
      return <i className="bi bi-arrow-down text-danger"></i>;
    }
    return <i className="bi bi-dash"></i>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard Quản trị
          </h2>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            title="Đóng"
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Đơn hàng hôm nay</h6>
                    <h3 className="mb-0">{stats.orders.today}</h3>
                    <small className="opacity-75">
                      {getChangeIcon(stats.orders.change_percent)}{" "}
                      {Math.abs(stats.orders.change_percent)}% so với hôm qua
                    </small>
                  </div>
                  <div className="fs-1 opacity-75">
                    <i className="bi bi-cart"></i>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-top border-light">
                  <small>
                    Tổng: {stats.orders.total} | Chưa thanh toán:{" "}
                    {stats.orders.unpaid}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Doanh thu hôm nay</h6>
                    <h3 className="mb-0">
                      {(stats.revenue.today / 1000000).toFixed(1)}M
                    </h3>
                    <small className="opacity-75">
                      {getChangeIcon(stats.revenue.change_percent)}{" "}
                      {Math.abs(stats.revenue.change_percent)}% so với hôm qua
                    </small>
                  </div>
                  <div className="fs-1 opacity-75">
                    <i className="bi bi-currency-dollar"></i>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-top border-light">
                  <small>
                    Tháng này: {(stats.revenue.this_month / 1000000).toFixed(1)}
                    M
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Bàn đang phục vụ</h6>
                    <h3 className="mb-0">{stats.tables.unavailable}</h3>
                    <small className="opacity-75">
                      Đang có khách / {stats.tables.total} bàn
                    </small>
                  </div>
                  <div className="fs-1 opacity-75">
                    <i className="bi bi-people"></i>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-top border-light">
                  <small>Bàn trống: {stats.tables.available}</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-warning text-dark h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Menu & Nguyên liệu</h6>
                    <h3 className="mb-0">{stats.menu.total}</h3>
                    <small className="opacity-75">Món ăn hiện có</small>
                  </div>
                  <div className="fs-1 opacity-75">
                    <i className="bi bi-book"></i>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-top border-dark">
                  <small>
                    {stats.ingredients.low_stock > 0 && (
                      <span className="text-danger">
                        <i className="bi bi-exclamation-triangle"></i>{" "}
                        {stats.ingredients.low_stock} NL sắp hết
                      </span>
                    )}
                    {stats.ingredients.low_stock === 0 && (
                      <span className="text-success">
                        <i className="bi bi-check-circle"></i> Nguyên liệu ổn
                        định
                      </span>
                    )}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts & Activity */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h6 className="card-title mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Doanh thu 7 ngày gần đây
              </h6>
            </div>
            <div className="card-body">
              {revenueData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th className="text-end">Số đơn</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((item, index) => (
                        <tr key={index}>
                          <td>{formatShortDate(item.date)}</td>
                          <td className="text-end">{item.orders_count}</td>
                          <td className="text-end">
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="fw-bold">
                        <td>Tổng</td>
                        <td className="text-end">
                          {revenueData.reduce(
                            (sum, item) => sum + item.orders_count,
                            0
                          )}
                        </td>
                        <td className="text-end">
                          {formatCurrency(
                            revenueData.reduce(
                              (sum, item) => sum + item.revenue,
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-bar-chart display-1 text-muted"></i>
                  <p className="text-muted mt-3">Chưa có dữ liệu doanh thu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h6 className="card-title mb-0">
                <i className="bi bi-star me-2"></i>
                Top 5 món bán chạy (30 ngày)
              </h6>
            </div>
            <div className="card-body">
              {topItems.length > 0 ? (
                <div className="list-group list-group-flush">
                  {topItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="list-group-item border-0 px-0"
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="badge bg-primary rounded-circle me-3"
                          style={{
                            width: "30px",
                            height: "30px",
                            lineHeight: "20px",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{item.name}</div>
                          <small className="text-muted">
                            Đã bán: {item.total_quantity} | Doanh thu:{" "}
                            {formatCurrency(item.total_revenue)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-star display-1 text-muted"></i>
                  <p className="text-muted mt-3">Chưa có dữ liệu bán hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Toggle Button */}
      {/* <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-primary"
            onClick={() => setShowInsights(!showInsights)}
          >
            <i
              className={`bi bi-${showInsights ? "eye-slash" : "eye"} me-2`}
            ></i>
            {showInsights ? "Ẩn Insights" : "Xem Insights Chi Tiết"}
          </button>
        </div>
      </div> */}

      {/* Insights Section */}
      {/* {showInsights && ( */}
      <>
        {/* Most Expensive Items */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header bg-white">
                <h6 className="card-title mb-0">
                  <i className="bi bi-gem me-2"></i>
                  Món ăn đắt nhất
                </h6>
              </div>
              <div className="card-body">
                {expensiveItems.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Món ăn</th>
                          <th>Danh mục</th>
                          <th className="text-end">Giá</th>
                          <th className="text-end">Đã bán</th>
                          <th className="text-end">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expensiveItems.map(item => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.name}</strong>
                              {item.status === "unavailable" && (
                                <span className="badge bg-secondary ms-2">
                                  Không có
                                </span>
                              )}
                            </td>
                            <td>{item.category}</td>
                            <td className="text-end fw-bold text-danger">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="text-end">{item.sales_count}</td>
                            <td className="text-end">
                              {formatCurrency(item.total_revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-gem display-1 text-muted"></i>
                    <p className="text-muted mt-3">Chưa có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order History by Time */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header bg-white">
                <h6 className="card-title mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Phân bố đơn hàng theo thời gian (30 ngày)
                </h6>
              </div>
              <div className="card-body">
                {orderHistory && (
                  <>
                    <div className="mb-4">
                      <h6>Theo khung giờ</h6>
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body text-center py-2">
                              <i className="bi bi-sunrise fs-4 text-warning"></i>
                              <div className="fw-bold">
                                {orderHistory.time_distribution.morning}
                              </div>
                              <small className="text-muted">Sáng (6-11h)</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body text-center py-2">
                              <i className="bi bi-sun fs-4 text-orange"></i>
                              <div className="fw-bold">
                                {orderHistory.time_distribution.afternoon}
                              </div>
                              <small className="text-muted">
                                Chiều (12-17h)
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body text-center py-2">
                              <i className="bi bi-sunset fs-4 text-danger"></i>
                              <div className="fw-bold">
                                {orderHistory.time_distribution.evening}
                              </div>
                              <small className="text-muted">Tối (18-21h)</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="card bg-light">
                            <div className="card-body text-center py-2">
                              <i className="bi bi-moon-stars fs-4 text-primary"></i>
                              <div className="fw-bold">
                                {orderHistory.time_distribution.night}
                              </div>
                              <small className="text-muted">Đêm (22-5h)</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="alert alert-info mb-0">
                      <strong>Giá trị đơn trung bình:</strong>{" "}
                      {formatCurrency(orderHistory.average_order_value)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Most Active Tables */}
        {orderHistory && orderHistory.most_active_tables.length > 0 && (
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-white">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-grid-3x3 me-2"></i>
                    Bàn hoạt động nhiều nhất (30 ngày)
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {orderHistory.most_active_tables.map((table, index) => (
                      <div className="col-md-4 col-lg-2" key={table.id}>
                        <div
                          className={`card text-center ${
                            index === 0 ? "border-primary" : ""
                          }`}
                        >
                          <div className="card-body">
                            {index === 0 && (
                              <i className="bi bi-trophy-fill text-warning fs-3 mb-2"></i>
                            )}
                            <h4 className="mb-1">{table.name}</h4>
                            <div className="text-muted small mb-1">
                              {table.order_count} đơn hàng
                            </div>
                            <div className="fw-bold text-success">
                              {formatCurrency(table.total_revenue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Peak Hours */}
        {peakHours.length > 0 && (
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-white">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-graph-up-arrow me-2"></i>
                    Giờ cao điểm (30 ngày)
                  </h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Giờ</th>
                          {peakHours.map(hour => (
                            <th key={hour.hour} className="text-center">
                              {hour.hour}h
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="fw-bold">Đơn hàng</td>
                          {peakHours.map(hour => (
                            <td key={hour.hour} className="text-center">
                              <span
                                className={
                                  hour.is_peak ? "badge bg-danger" : ""
                                }
                              >
                                {hour.order_count}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="fw-bold">Doanh thu</td>
                          {peakHours.map(hour => (
                            <td key={hour.hour} className="text-center small">
                              {(hour.revenue / 1000).toFixed(0)}K
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="alert alert-warning mt-3 mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      Giờ cao điểm được đánh dấu đỏ (đơn hàng {">"} 70% so với
                      giờ đông nhất)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
      {/* )} */}

      {/* Recent Orders Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white">
              <h6 className="card-title mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Đơn hàng gần đây
              </h6>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Bàn</th>
                        <th>Số món</th>
                        <th>Thời gian</th>
                        <th className="text-end">Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>
                            <i className="bi bi-grid-3x3 me-1"></i>
                            {order.table.name}
                          </td>
                          <td>{order.items_count}</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td className="text-end fw-bold">
                            {formatCurrency(order.total_amount)}
                          </td>
                          <td>{getStatusBadge(order.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-receipt display-1 text-muted"></i>
                  <p className="text-muted mt-3">Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
