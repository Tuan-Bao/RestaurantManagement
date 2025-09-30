import React from "react";
import type { MenuItem } from "../../types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onToggleAvailability: (itemId: number) => void;
  onViewDetails: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onToggleAvailability,
  onViewDetails,
}) => {
  return (
    <div
      className={`card h-100 menu-item-card ${!item.isAvailable ? "unavailable" : ""
        }`}
    >
      <div className="card-body">
        {/* Item Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <h6 className="card-title mb-1 d-flex align-items-center">
              {item.name}
              {item.isPopular && (
                <span className="badge bg-warning text-dark ms-2">
                  <i className="bi bi-star-fill me-1"></i>
                  Phổ biến
                </span>
              )}
            </h6>

            <p className="card-text text-muted small mb-2 line-clamp-2">
              {item.description}
            </p>

            <div className="d-flex align-items-center gap-3 mb-2">
              <span className="fw-bold text-primary fs-6">
                {item.price.toLocaleString("vi-VN")}đ
              </span>
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                {item.preparationTime} phút
              </small>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={item.isAvailable}
              onChange={() => onToggleAvailability(item.id)}
              id={`availability-${item.id}`}
            />
            <label
              className="form-check-label small"
              htmlFor={`availability-${item.id}`}
            >
              {item.isAvailable ? "Có sẵn" : "Hết món"}
            </label>
          </div>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mb-3">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="badge bg-light text-dark me-1">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="badge bg-light text-dark">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Ingredients Preview */}
        <div className="mb-3">
          <small className="text-muted d-block mb-1">
            <i className="bi bi-egg me-1"></i>
            Nguyên liệu chính:
          </small>
          <small className="text-secondary">
            {item.ingredients.slice(0, 3).join(", ")}
            {item.ingredients.length > 3 && "..."}
          </small>
        </div>

        {/* Allergens */}
        {item.allergens.length > 0 && (
          <div className="mb-3">
            <small className="text-warning d-block mb-1">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Chất gây dị ứng:
            </small>
            <div>
              {item.allergens.map((allergen, index) => (
                <span
                  key={index}
                  className="badge bg-warning text-dark me-1 small"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Info */}
        {item.nutritionInfo && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">
              <i className="bi bi-heart-pulse me-1"></i>
              Dinh dưỡng (100g):
            </small>
            <div className="row text-center">
              <div className="col-3">
                <small className="d-block fw-bold">
                  {item.nutritionInfo.calories}
                </small>
                <small className="text-muted">kcal</small>
              </div>
              <div className="col-3">
                <small className="d-block fw-bold">
                  {item.nutritionInfo.protein}g
                </small>
                <small className="text-muted">Protein</small>
              </div>
              <div className="col-3">
                <small className="d-block fw-bold">
                  {item.nutritionInfo.carbs}g
                </small>
                <small className="text-muted">Carb</small>
              </div>
              <div className="col-3">
                <small className="d-block fw-bold">
                  {item.nutritionInfo.fat}g
                </small>
                <small className="text-muted">Chất béo</small>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-auto">
          <button
            className="btn btn-primary btn-sm flex-grow-1"
            onClick={() => onViewDetails(item)}
          >
            <i className="bi bi-eye me-1"></i>
            Xem công thức
          </button>
        </div>
      </div>

      {/* Status Overlay */}
      {!item.isAvailable && (
        <div className="unavailable-overlay">
          <div className="text-center">
            <i className="bi bi-pause-circle-fill text-danger fs-1 mb-2"></i>
            <div className="fw-bold text-danger">Hết món</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemCard;
