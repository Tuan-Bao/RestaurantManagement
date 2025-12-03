import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const AdminDashboard: React.FC = () => {
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

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Tổng đơn hàng</h6>
                  <h3 className="mb-0">124</h3>
                  <small className="opacity-75">+12% so với hôm qua</small>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-cart"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Doanh thu</h6>
                  <h3 className="mb-0">15.2M</h3>
                  <small className="opacity-75">+8% so với hôm qua</small>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Khách hàng</h6>
                  <h3 className="mb-0">89</h3>
                  <small className="opacity-75">Đang phục vụ</small>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-people"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Bàn trống</h6>
                  <h3 className="mb-0">12/20</h3>
                  <small className="opacity-75">Còn trống</small>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-grid-3x3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Recent Orders */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Biểu đồ doanh thu
              </h6>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="bi bi-bar-chart display-1 text-muted"></i>
                <p className="text-muted mt-3">
                  Biểu đồ sẽ được hiển thị ở đây
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-clock me-2"></i>
                Hoạt động gần đây
              </h6>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex">
                    <div className="bg-success rounded-circle p-1 me-3">
                      <i className="bi bi-check text-white"></i>
                    </div>
                    <div className="flex-grow-1">
                      <small className="fw-bold">Đơn #123 đã thanh toán</small>
                      <br />
                      <small className="text-muted">2 phút trước</small>
                    </div>
                  </div>
                </div>

                <div className="list-group-item border-0 px-0">
                  <div className="d-flex">
                    <div className="bg-primary rounded-circle p-1 me-3">
                      <i className="bi bi-plus text-white"></i>
                    </div>
                    <div className="flex-grow-1">
                      <small className="fw-bold">Đơn mới từ bàn 5</small>
                      <br />
                      <small className="text-muted">5 phút trước</small>
                    </div>
                  </div>
                </div>

                <div className="list-group-item border-0 px-0">
                  <div className="d-flex">
                    <div className="bg-warning rounded-circle p-1 me-3">
                      <i className="bi bi-exclamation text-dark"></i>
                    </div>
                    <div className="flex-grow-1">
                      <small className="fw-bold">Món ăn sắp hết</small>
                      <br />
                      <small className="text-muted">10 phút trước</small>
                    </div>
                  </div>
                </div>

                <div className="list-group-item border-0 px-0">
                  <div className="d-flex">
                    <div className="bg-info rounded-circle p-1 me-3">
                      <i className="bi bi-person text-white"></i>
                    </div>
                    <div className="flex-grow-1">
                      <small className="fw-bold">Nhân viên vào ca</small>
                      <br />
                      <small className="text-muted">15 phút trước</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Đơn hàng gần đây
              </h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Bàn</th>
                      <th>Khách hàng</th>
                      <th>Thời gian</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#123</td>
                      <td>Bàn 5</td>
                      <td>Nguyễn Văn A</td>
                      <td>19:30</td>
                      <td>450,000đ</td>
                      <td>
                        <span className="badge bg-success">Đã thanh toán</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          aria-label="View Order #123"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>#124</td>
                      <td>Bàn 3</td>
                      <td>Trần Thị B</td>
                      <td>19:45</td>
                      <td>320,000đ</td>
                      <td>
                        <span className="badge bg-warning">Đang phục vụ</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          aria-label="View Order #124"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>#125</td>
                      <td>Bàn 7</td>
                      <td>Lê Văn C</td>
                      <td>20:00</td>
                      <td>280,000đ</td>
                      <td>
                        <span className="badge bg-primary">Mới</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          aria-label="View Order #125"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
// chỉnh uI
export default AdminDashboard;
