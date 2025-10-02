import React, { useState } from 'react';
import { inventoryApi } from '../../services/inventory';
import type { StockInCreateData } from '../../types/inventory';
import { UNIT_CHOICES } from '../../types/inventory';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const StockInModal: React.FC<StockInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<StockInCreateData>({
    ingredient_name: '',
    ingredient_unit: 'kg',
    min_quantity: 0,
    quantity: 0,
    price: undefined,
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
        price: formData.price || undefined, // Convert empty string to undefined
      };

      const response = await inventoryApi.createStockIn(dataToSubmit);
      
      // Show success message
      alert(`Nhập kho thành công!\n${response.message}\n\nNguyên liệu: ${response.ingredient_update.ingredient_name}\nSố lượng trước: ${response.ingredient_update.previous_quantity}\nSố lượng nhập: ${response.ingredient_update.incoming_quantity}\nSố lượng hiện tại: ${response.ingredient_update.new_quantity}`);
      
      // Reset form
      setFormData({
        ingredient_name: '',
        ingredient_unit: 'kg',
        min_quantity: 0,
        quantity: 0,
        price: undefined,
      });
      
      onSuccess(); // Refresh parent component
      onClose(); // Close modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StockInCreateData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-arrow-down-circle me-2"></i>
              Nhập kho
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
                  placeholder="Nhập tên nguyên liệu"
                />
                <div className="form-text">
                  Nếu nguyên liệu chưa có sẽ tự động tạo mới
                </div>
              </div>

              {/* Unit */}
              <div className="mb-3">
                <label className="form-label">
                  Đơn vị tính <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  required
                  value={formData.ingredient_unit}
                  onChange={(e) => handleInputChange('ingredient_unit', e.target.value)}
                >
                  {UNIT_CHOICES.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <label className="form-label">
                  Số lượng nhập <span className="text-danger">*</span>
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

              {/* Min Quantity */}
              <div className="mb-3">
                <label className="form-label">Mức tối thiểu</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.001"
                  value={formData.min_quantity}
                  onChange={(e) => handleInputChange('min_quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0.000"
                />
                <div className="form-text">
                  Ngưỡng cảnh báo sắp hết hàng
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <label className="form-label">
                  <i className="bi bi-currency-dollar me-1"></i>
                  Tổng giá tiền (tùy chọn)
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="1000"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || undefined)}
                  placeholder="VND"
                />
                <div className="form-text">
                  Tổng giá tiền cho lô hàng này (để tính giá đơn vị)
                </div>
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
                className="btn btn-success"
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
                    Nhập kho
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

export default StockInModal;