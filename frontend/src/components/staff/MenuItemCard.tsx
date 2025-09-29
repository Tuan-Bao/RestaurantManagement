import React from "react";
import type { MenuItem } from "../../types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onToggleAvailability: (itemId: number) => void;
  onViewDetails: (item: MenuItem) => void;
}

const formatVND = (n: number) =>
  (n ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onToggleAvailability,
  onViewDetails,
}) => {
  const tags = item.tags ?? [];
  const ingredients = item.ingredients ?? [];
  const allergens = item.allergens ?? [];

  return (
    <div
      className={`card h-100 menu-item-card ${
        !item.isAvailable ? "unavailable" : ""
      }`}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1 pe-3">
            <h6 className="card-title mb-1 d-flex align-items-center">
              <span className="text-truncate">{item.name}</span>
              {item.isPopular && (
                <span className="badge bg-warning text-dark ms-2">
                  <i className="bi bi-star-fill me-1" />
                  Phổ biến
                </span>
              )}
            </h6>

            {item.description && (
              <p className="card-text text-muted small mb-2 line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="d-flex align-items-center gap-3 mb-2">
              <span className="fw-bold text-primary fs-6">
                {formatVND(item.price)}đ
              </span>
              {typeof item.preparationTime === "number" && (
                <small className="text-muted">
                  <i className="bi bi-clock me-1" />
                  {item.preparationTime} phút
                </small>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="form-check form-switch text-nowrap">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={!!item.isAvailable}
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
        {tags.length > 0 && (
          <div className="mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={`${tag}-${index}`} className="badge bg-light text-dark me-1">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="badge bg-light text-dark">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">
              <i className="bi bi-egg me-1" />
              Nguyên liệu chính:
            </small>
            <small className="text-secondary">
              {ingredients.slice(0, 3).join(", ")}
              {ingredients.length > 3 && "..."}
            </small>
          </div>
        )}

        {/* Allergens */}
        {allergens.length > 0 && (
          <div className="mb-3">
            <small className="text-warning d-block mb-1">
              <i className="bi bi-exclamation-triangle me-1" />
              Chất gây dị ứng:
            </small>
            <div className="d-flex flex-wrap">
              {allergens.map((a, idx) => (
                <span
                  key={`${a}-${idx}`}
                  className="badge bg-warning text-dark me-1 mb-1 small"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition */}
        {item.nutritionInfo && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">
              <i className="bi bi-heart-pulse me-1" />
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

        {/* Actions */}
        <div className="d-flex gap-2 mt-auto">
          <button
            className="btn btn-primary btn-sm flex-grow-1"
            onClick={() => onViewDetails(item)}
          >
            <i className="bi bi-eye me-1" />
            Xem công thức
          </button>

          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Thao tác khác"
            >
              <i className="bi bi-gear" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => onToggleAvailability(item.id)}
                >
                  <i
                    className={`bi ${
                      item.isAvailable ? "bi-pause-circle" : "bi-play-circle"
                    } me-2`}
                  />
                  {item.isAvailable ? "Đánh dấu hết món" : "Đánh dấu có sẵn"}
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item">
                  <i className="bi bi-pencil me-2" />
                  Chỉnh sửa thông tin
                </button>
              </li>
              <li>
                <button className="dropdown-item">
                  <i className="bi bi-printer me-2" />
                  In công thức
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Overlay trạng thái */}
      {!item.isAvailable && (
        <div className="unavailable-overlay">
          <div className="text-center">
            <i className="bi bi-pause-circle-fill text-danger fs-1 mb-2" />
            <div className="fw-bold text-danger">Hết món</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemCard;
