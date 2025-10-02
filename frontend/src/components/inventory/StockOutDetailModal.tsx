import React from 'react';
import type { StockOut } from '../../types/inventory';

interface StockOutDetailModalProps {
  isOpen: boolean;
  stockOut: StockOut | null;
  onClose: () => void;
}

const StockOutDetailModal: React.FC<StockOutDetailModalProps> = ({ 
  isOpen, 
  stockOut, 
  onClose 
}) => {
  if (!isOpen || !stockOut) return null;

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

  const getReasonInfo = (reason: string, orderItem?: any) => {
    const isAutomatic = reason === 'cooking' && orderItem;
    
    if (isAutomatic) {
      return {
        label: 'Tự động (Nấu ăn)',
        icon: 'bi-gear',
        color: 'warning',
        description: 'Hệ thống tự động xuất kho khi nấu món ăn'
      };
    }
    
    switch (reason) {
      case 'expired':
        return {
          label: 'Hết hạn',
          icon: 'bi-exclamation-triangle',
          color: 'danger',
          description: 'Nguyên liệu đã hết hạn sử dụng'
        };
      case 'damaged':
        return {
          label: 'Hỏng hóc',
          icon: 'bi-x-circle',
          color: 'secondary',
          description: 'Nguyên liệu bị hư hỏng, không thể sử dụng'
        };
      case 'manual':
        return {
          label: 'Thủ công',
          icon: 'bi-hand-index',
          color: 'primary',
          description: 'Xuất kho thủ công bởi người dùng'
        };
      default:
        return {
          label: 'Khác',
          icon: 'bi-question-circle',
          color: 'info',
          description: 'Lý do khác'
        };
    }
  };

  const reasonInfo = getReasonInfo(stockOut.reason, stockOut.order_item);

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <i className="bi bi-arrow-up-circle me-2"></i>
              Chi tiết phiếu xuất kho
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
                        <div className="fw-bold fs-5 text-danger">#{stockOut.id}</div>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted small">Thời gian xuất</label>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar-event me-2 text-muted"></i>
                          <span>{formatDate(stockOut.created_at)}</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted small">Người thực hiện</label>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-badge me-2 text-muted"></i>
                          <span>{stockOut.user.username}</span>
                          {stockOut.user.first_name && stockOut.user.last_name && (
                            <small className="text-muted ms-2">
                              ({stockOut.user.first_name} {stockOut.user.last_name})
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
                          <span className="fw-bold">{stockOut.ingredient.name}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small">Đơn vị tính</label>
                        <div>
                          <span className="badge bg-info">{stockOut.ingredient.unit}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small">Số lượng xuất</label>
                        <div className="fw-bold text-danger fs-5">
                          {stockOut.quantity} {stockOut.ingredient.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lý do xuất kho */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-clipboard-check me-2"></i>
                      Lý do xuất kho
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Loại xuất kho</label>
                        <div>
                          <span className={`badge bg-${reasonInfo.color} fs-6`}>
                            <i className={`${reasonInfo.icon} me-1`}></i>
                            {reasonInfo.label}
                          </span>
                        </div>
                        <div className="text-muted small mt-1">
                          {reasonInfo.description}
                        </div>
                      </div>

                      {/* Thông tin đơn hàng nếu có */}
                      {stockOut.order_item && (
                        <div className="col-md-6">
                          <label className="form-label text-muted small">Liên quan đến đơn hàng</label>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-receipt me-2 text-warning"></i>
                            <span className="fw-bold">Đơn hàng #{stockOut.order_item.order}</span>
                          </div>
                          <div className="text-muted small mt-1">
                            Xuất kho tự động khi nấu món ăn
                          </div>
                        </div>
                      )}

                      {/* Ghi chú */}
                      {stockOut.notes && (
                        <div className="col-12">
                          <label className="form-label text-muted small">Ghi chú</label>
                          <div className="border rounded p-3 bg-light">
                            <i className="bi bi-chat-left-text me-2 text-muted"></i>
                            {stockOut.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trạng thái hiện tại của nguyên liệu */}
              <div className="col-12">
                <div className="card border-info">
                  <div className="card-header bg-info text-white">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-graph-down-arrow me-2"></i>
                      Trạng thái hiện tại của nguyên liệu
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label text-muted small">ID nguyên liệu</label>
                        <div className="fw-bold">#{stockOut.ingredient.id}</div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Tồn kho hiện tại</label>
                        <div className="fw-bold text-primary">
                          {stockOut.ingredient.stock_quantity} {stockOut.ingredient.unit}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Mức tối thiểu</label>
                        <div className="fw-bold text-warning">
                          {stockOut.ingredient.min_quantity} {stockOut.ingredient.unit}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Trạng thái</label>
                        <div>
                          {stockOut.ingredient.status === 'active' ? (
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
                          {stockOut.ingredient.is_low_stock && stockOut.ingredient.status === 'active' && (
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

export default StockOutDetailModal;