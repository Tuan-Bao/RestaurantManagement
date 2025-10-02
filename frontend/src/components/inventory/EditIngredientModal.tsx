import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/inventory';
import type { Ingredient, IngredientUpdateData } from '../../types/inventory';
import { UNIT_CHOICES } from '../../types/inventory';

interface EditIngredientModalProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditIngredientModal: React.FC<EditIngredientModalProps> = ({ 
  isOpen, 
  ingredient, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<IngredientUpdateData>({
    name: '',
    unit: 'kg',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when ingredient changes
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        unit: ingredient.unit,
      });
    }
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient) return;

    setLoading(true);
    setError(null);

    try {
      const response = await inventoryApi.updateIngredient(ingredient.id, formData);
      
      // Show success message
      alert(`Cập nhật nguyên liệu thành công!\n\nTên mới: ${response.data.name}\nĐơn vị mới: ${response.data.unit}`);
      
      onSuccess(); // Refresh parent component
      onClose(); // Close modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi cập nhật nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IngredientUpdateData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const isDataChanged = () => {
    if (!ingredient) return false;
    return formData.name !== ingredient.name || formData.unit !== ingredient.unit;
  };

  if (!isOpen || !ingredient) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2 text-primary"></i>
              Chỉnh sửa nguyên liệu
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

              {/* Current Info Display */}
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <h6 className="card-title">Thông tin hiện tại:</h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <small className="text-muted">ID:</small>
                      <div className="fw-medium">{ingredient.id}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Tồn kho:</small>
                      <div className="fw-medium">{ingredient.stock_quantity} {ingredient.unit}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Trạng thái:</small>
                      <div className={`fw-medium ${ingredient.status === 'active' ? 'text-success' : 'text-danger'}`}>
                        {ingredient.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Sắp hết:</small>
                      <div className={`fw-medium ${ingredient.is_low_stock ? 'text-danger' : 'text-success'}`}>
                        {ingredient.is_low_stock ? 'Có' : 'Không'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Note */}
              <div className="alert alert-warning">
                <div>
                  <div className="fw-bold">Lưu ý:</div>
                  <div>Chỉ có thể chỉnh sửa tên và đơn vị. Số lượng tồn kho được quản lý thông qua nhập/xuất kho.</div>
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
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên nguyên liệu"
                />
              </div>

              {/* Unit */}
              <div className="mb-3">
                <label className="form-label">
                  Đơn vị tính <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  required
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                >
                  {UNIT_CHOICES.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Change Summary */}
              {isDataChanged() && (
                <div className="alert alert-info">
                  <div className="fw-bold mb-1">Các thay đổi:</div>
                  {formData.name !== ingredient.name && (
                    <div>• Tên: "{ingredient.name}" → "{formData.name}"</div>
                  )}
                  {formData.unit !== ingredient.unit && (
                    <div>• Đơn vị: "{ingredient.unit}" → "{formData.unit}"</div>
                  )}
                </div>
              )}
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
                className="btn btn-primary"
                disabled={loading || !isDataChanged()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check me-1"></i>
                    Cập nhật
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

export default EditIngredientModal;