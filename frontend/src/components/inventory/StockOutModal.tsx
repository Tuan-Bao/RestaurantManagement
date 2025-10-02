import React, { useState } from 'react';
import { inventoryApi } from '../../services/inventory';
import type { StockOutCreateData } from '../../types/inventory';
import { REASON_CHOICES } from '../../types/inventory';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const StockOutModal: React.FC<StockOutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<StockOutCreateData>({
    ingredient_name: '',
    quantity: 0,
    reason: 'expired',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        notes: formData.notes?.trim() || undefined, // Convert empty string to undefined
      };

      const response = await inventoryApi.createStockOut(dataToSubmit);
      
      // Show success message
      alert(`Xuất kho thành công!\n${response.message}\n\nNguyên liệu: ${response.ingredient_update.ingredient_name}\nSố lượng trước: ${response.ingredient_update.previous_quantity}\nSố lượng xuất: ${response.ingredient_update.outgoing_quantity}\nSố lượng hiện tại: ${response.ingredient_update.new_quantity}${response.ingredient_update.status_changed ? '\n\nTrạng thái đã chuyển sang "Hết hàng"' : ''}`);
      
      // Reset form
      setFormData({
        ingredient_name: '',
        quantity: 0,
        reason: 'expired',
        notes: '',
      });
      
      onSuccess(); // Refresh parent component
      onClose(); // Close modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StockOutCreateData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'expired':
        return <i className="bi bi-exclamation-triangle text-danger"></i>;
      case 'damaged':
        return <i className="bi bi-x-circle text-warning"></i>;
      default:
        return <i className="bi bi-arrow-up-circle text-secondary"></i>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-arrow-up-circle me-2 text-danger"></i>
              Xuất kho thủ công
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Error Message */}
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Warning Note */}
              <div className="alert alert-warning">
                <div className="d-flex align-items-start">
                  <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
                  <div>
                    <div className="fw-bold">Lưu ý:</div>
                    <div>Chức năng này chỉ dành cho xuất kho thủ công. Khi nấu ăn, hệ thống sẽ tự động xuất kho.</div>
                  </div>
                </div>
              </div>

              {/* Ingredient Name */}
              <div className="mb-3">
                <label className="form-label">
                  Tên nguyên liệu <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.ingredient_name}
                  onChange={(e) => handleInputChange('ingredient_name', e.target.value)}
                  placeholder="Nhập tên nguyên liệu có sẵn trong kho"
                />
                <div className="form-text">
                  Chỉ có thể xuất nguyên liệu đã có trong kho
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <label className="form-label">
                  Số lượng xuất <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min="0.001"
                  step="0.001"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0.000"
                />
              </div>

              {/* Reason */}
              <div className="mb-3">
                <label className="form-label">
                  Lý do xuất kho <span className="text-danger">*</span>
                </label>
                <div className="vstack gap-2">
                  {REASON_CHOICES.map((reason) => (
                    <div key={reason.value} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="reason"
                        id={`reason-${reason.value}`}
                        value={reason.value}
                        checked={formData.reason === reason.value}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor={`reason-${reason.value}`}>
                        {getReasonIcon(reason.value)}
                        <span className="ms-2">{reason.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Mô tả chi tiết về lý do xuất kho..."
                ></textarea>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check me-1"></i>
                    Xuất kho
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockOutModal;