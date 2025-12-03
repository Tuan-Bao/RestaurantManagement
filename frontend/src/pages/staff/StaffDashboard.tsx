import React from "react";
import StaffLayout from "../../layouts/StaffLayout";

const StaffDashboard: React.FC = () => {
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
              <h4 className="mb-1">8</h4>
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
              <h4 className="mb-1">15</h4>
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
              <h4 className="mb-1">5</h4>
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
              <h4 className="mb-1">2.8M</h4>
              <small>Doanh thu ca này</small>
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
              <button className="btn btn-sm btn-primary">
                <i className="bi bi-arrow-clockwise me-1"></i>
                Làm mới
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Order Card 1 */}
                <div className="col-md-6">
                  <div className="card border-primary">
                    <div className="card-header bg-primary text-white d-flex justify-content-between">
                      <span>
                        <i className="bi bi-grid-3x3 me-1"></i>Bàn 3
                      </span>
                      <span className="badge bg-light text-dark">Mới</span>
                    </div>
                    <div className="card-body p-3">
                      <small className="text-muted">Đơn #125 - 20:00</small>
                      <div className="mt-2">
                        <small className="d-block">• 2x Phở bò tái (80k)</small>
                        <small className="d-block">• 1x Nước ngọt (15k)</small>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <strong>Tổng: 175,000đ</strong>
                        <button className="btn btn-sm btn-success">
                          Xử lý
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Card 2 */}
                <div className="col-md-6">
                  <div className="card border-warning">
                    <div className="card-header bg-warning text-dark d-flex justify-content-between">
                      <span>
                        <i className="bi bi-grid-3x3 me-1"></i>Bàn 7
                      </span>
                      <span className="badge bg-dark">Đang phục vụ</span>
                    </div>
                    <div className="card-body p-3">
                      <small className="text-muted">Đơn #124 - 19:45</small>
                      <div className="mt-2">
                        <small className="d-block">• 1x Bún bò Huế (65k)</small>
                        <small className="d-block">• 2x Trà đá (10k)</small>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <strong>Tổng: 85,000đ</strong>
                        <button className="btn btn-sm btn-primary">
                          Thanh toán
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Card 3 */}
                <div className="col-md-6">
                  <div className="card border-info">
                    <div className="card-header bg-info text-white d-flex justify-content-between">
                      <span>
                        <i className="bi bi-grid-3x3 me-1"></i>Bàn 12
                      </span>
                      <span className="badge bg-light text-dark">Chờ món</span>
                    </div>
                    <div className="card-body p-3">
                      <small className="text-muted">Đơn #123 - 19:30</small>
                      <div className="mt-2">
                        <small className="d-block">• 3x Cơm gà (90k)</small>
                        <small className="d-block">• 1x Soup (25k)</small>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <strong>Tổng: 315,000đ</strong>
                        <button className="btn btn-sm btn-outline-info">
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add New Order Card */}
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
              <div className="alert alert-warning">
                <small>
                  <i className="bi bi-clock me-1"></i>
                  Bàn 5 chờ quá 15 phút
                </small>
              </div>
              <div className="alert alert-danger">
                <small>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Phở bò sắp hết (còn 3 suất)
                </small>
              </div>
              <div className="alert alert-info">
                <small>
                  <i className="bi bi-info-circle me-1"></i>
                  Có 2 bàn mới đặt chỗ
                </small>
              </div>

              <hr />

              <h6 className="mb-3">
                <i className="bi bi-list-ul me-2"></i>
                Nhiệm vụ hôm nay
              </h6>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked
                  placeholder="Kiểm tra kho buổi sáng"
                />
                <label className="form-check-label">
                  <small>Kiểm tra kho buổi sáng</small>
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  placeholder="Cập nhật menu ngày"
                />
                <label className="form-check-label">
                  <small>Cập nhật menu ngày</small>
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  placeholder="Dọn dẹp khu vực bàn"
                />
                <label className="form-check-label">
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
// check repo
export default StaffDashboard;
