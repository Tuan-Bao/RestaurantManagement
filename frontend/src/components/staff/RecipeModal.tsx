import React from "react";
import type { MenuItem } from "../../types/menu";

interface RecipeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: MenuItem) => void;
  showEditButton?: boolean;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ 
  item, 
  isOpen, 
  onClose, 
  onEdit, 
  showEditButton = false 
}) => {
  if (!isOpen || !item) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-info-circle me-2"></i>
                Chi tiết món ăn
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {/* Item Overview */}
              <div className="mb-4">
                <h4 className="mb-2">{item.name}</h4>
                <p className="text-muted mb-4">{item.description}</p>

                <div className="row mb-4">
                  <div className="col-6">
                    <div className="border-start border-primary border-3 ps-3">
                      <small className="text-muted d-block">Giá bán</small>
                      <h5 className="text-primary mb-0">
                        {item.price.toLocaleString("vi-VN")}đ
                      </h5>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border-start border-info border-3 ps-3">
                      <small className="text-muted d-block">
                        Thời gian chuẩn bị
                      </small>
                      <h5 className="text-info mb-0">{item.preparationTime} phút</h5>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-egg me-2 text-primary"></i>
                      Nguyên liệu ({item.ingredients.length})
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {item.ingredients.map((ingredient, index) => (
                        <div key={index} className="col-md-6 mb-2">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-dot text-primary me-2 fs-4"></i>
                            <span>{ingredient}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Allergens */}
                {item.allergens.length > 0 && (
                  <div className="alert alert-warning mt-3">
                    <h6 className="alert-heading mb-2">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Chất gây dị ứng
                    </h6>
                    <div>
                      {item.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="badge bg-warning text-dark me-1"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Đóng
              </button>
              {showEditButton && onEdit && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onEdit(item)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Chỉnh sửa thông tin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default RecipeModal;
