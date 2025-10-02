import React from 'react';
import type { StockIn } from '../../types/inventory';

interface StockInDetailModalProps {
  isOpen: boolean;
  stockIn: StockIn | null;
  onClose: () => void;
}

const StockInDetailModal: React.FC<StockInDetailModalProps> = ({ 
  isOpen, 
  stockIn, 
  onClose 
}) => {
  if (!isOpen || !stockIn) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">
              <i className="bi bi-arrow-down-circle me-2"></i>
              Chi tiết phiếu nhập kho
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <div className="row g-4">
              {/* Thông tin cơ bản */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Thông tin phiếu
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label text-muted small">Mã phiếu</label>
                        <div className="fw-bold fs-5 text-success">#{stockIn.id}</div>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted small">Thời gian nhập</label>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar-event me-2 text-muted"></i>
                          <span>{formatDate(stockIn.created_at)}</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted small">Người thực hiện</label>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-badge me-2 text-muted"></i>
                          <span>{stockIn.user.username}</span>
                          {stockIn.user.first_name && stockIn.user.last_name && (
                            <small className="text-muted ms-2">
                              ({stockIn.user.first_name} {stockIn.user.last_name})
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin nguyên liệu */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-box-seam me-2"></i>
                      Thông tin nguyên liệu
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label text-muted small">Tên nguyên liệu</label>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-box me-2 text-primary"></i>
                          <span className="fw-bold">{stockIn.ingredient.name}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small">Đơn vị tính</label>
                        <div>
                          <span className="badge bg-info">{stockIn.ingredient.unit}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small">Số lượng nhập</label>
                        <div className="fw-bold text-success fs-5">
                          {stockIn.quantity} {stockIn.ingredient.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin giá cả */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-currency-dollar me-2"></i>
                      Thông tin giá cả
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label text-muted small">Tổng giá tiền</label>
                        <div className="fw-bold fs-5 text-primary">
                          {formatCurrency(stockIn.price)}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small">Giá đơn vị</label>
                        <div className="fw-bold fs-5 text-secondary">
                          {formatCurrency(stockIn.price_per_unit)}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small">Tính toán</label>
                        <div className="small text-muted">
                          {stockIn.price && stockIn.quantity ? (
                            <>
                              {formatCurrency(stockIn.price)} ÷ {stockIn.quantity} {stockIn.ingredient.unit}
                              = {formatCurrency(stockIn.price / stockIn.quantity)}
                            </>
                          ) : (
                            'Không có thông tin giá'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trạng thái hiện tại của nguyên liệu */}
              <div className="col-12">
                <div className="card border-info">
                  <div className="card-header bg-info text-white">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-graph-up-arrow me-2"></i>
                      Trạng thái hiện tại của nguyên liệu
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label text-muted small">ID nguyên liệu</label>
                        <div className="fw-bold">#{stockIn.ingredient.id}</div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Tồn kho hiện tại</label>
                        <div className="fw-bold text-primary">
                          {stockIn.ingredient.stock_quantity} {stockIn.ingredient.unit}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Mức tối thiểu</label>
                        <div className="fw-bold text-warning">
                          {stockIn.ingredient.min_quantity} {stockIn.ingredient.unit}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Trạng thái</label>
                        <div>
                          {stockIn.ingredient.status === 'active' ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Còn hàng
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              <i className="bi bi-x-circle me-1"></i>
                              Hết hàng
                            </span>
                          )}
                          {stockIn.ingredient.is_low_stock && stockIn.ingredient.status === 'active' && (
                            <span className="badge bg-warning ms-2">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Sắp hết
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-1"></i>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInDetailModal;