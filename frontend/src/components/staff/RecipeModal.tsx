import React from "react";
import type { MenuItem } from "../../types/menu";

interface RecipeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const getDifficultyBadge = (difficulty: string) => {
    const config = {
      easy: { color: "success", text: "Dễ", icon: "bi-check-circle" },
      medium: {
        color: "warning",
        text: "Trung bình",
        icon: "bi-exclamation-circle",
      },
      hard: { color: "danger", text: "Khó", icon: "bi-x-circle" },
    };
    return config[difficulty as keyof typeof config] || config.medium;
  };

  const difficultyInfo = item.recipe
    ? getDifficultyBadge(item.recipe.difficulty)
    : null;

  return (
    <>
      <div className="modal show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-journal-text me-2"></i>
                Công thức: {item.name}
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
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h6 className="mb-2">{item.name}</h6>
                      <p className="text-muted mb-3">{item.description}</p>

                      <div className="row">
                        <div className="col-6">
                          <small className="text-muted d-block">Giá bán</small>
                          <strong className="text-primary">
                            {item.price.toLocaleString("vi-VN")}đ
                          </strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">
                            Thời gian chuẩn bị
                          </small>
                          <strong>{item.preparationTime} phút</strong>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 text-end">
                      <div
                        className={`badge bg-${
                          item.isAvailable ? "success" : "danger"
                        } mb-2`}
                      >
                        <i
                          className={`bi ${
                            item.isAvailable
                              ? "bi-check-circle"
                              : "bi-pause-circle"
                          } me-1`}
                        ></i>
                        {item.isAvailable ? "Có sẵn" : "Hết món"}
                      </div>

                      {item.isPopular && (
                        <div className="badge bg-warning text-dark d-block">
                          <i className="bi bi-star-fill me-1"></i>
                          Món phổ biến
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipe Information */}
              {item.recipe ? (
                <div className="row">
                  <div className="col-md-8">
                    {/* Instructions */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-list-ol me-2"></i>
                          Hướng dẫn thực hiện
                        </h6>
                      </div>
                      <div className="card-body">
                        <ol className="list-group list-group-numbered list-group-flush">
                          {item.recipe.instructions.map(
                            (instruction, index) => (
                              <li
                                key={index}
                                className="list-group-item border-0 px-0"
                              >
                                {instruction}
                              </li>
                            )
                          )}
                        </ol>
                      </div>
                    </div>

                    {/* Equipment */}
                    {item.recipe.equipment.length > 0 && (
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-tools me-2"></i>
                            Dụng cụ cần thiết
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            {item.recipe.equipment.map((equipment, index) => (
                              <div key={index} className="col-md-6 mb-2">
                                <i className="bi bi-wrench me-2 text-muted"></i>
                                {equipment}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-4">
                    {/* Recipe Stats */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          Thông tin công thức
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <small className="text-muted d-block">Độ khó</small>
                          {difficultyInfo && (
                            <span
                              className={`badge bg-${difficultyInfo.color}`}
                            >
                              <i className={`${difficultyInfo.icon} me-1`}></i>
                              {difficultyInfo.text}
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Thời gian nấu
                          </small>
                          <strong>{item.recipe.cookingTime} phút</strong>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Khẩu phần
                          </small>
                          <strong>{item.recipe.servingSize} người</strong>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-egg me-2"></i>
                          Nguyên liệu ({item.ingredients.length})
                        </h6>
                      </div>
                      <div className="card-body">
                        {item.ingredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center mb-2"
                          >
                            <i className="bi bi-dot text-primary me-2"></i>
                            <span>{ingredient}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Allergens */}
                    {item.allergens.length > 0 && (
                      <div className="alert alert-warning">
                        <h6 className="alert-heading">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Chất gây dị ứng
                        </h6>
                        {item.allergens.map((allergen, index) => (
                          <span
                            key={index}
                            className="badge bg-warning text-dark me-1"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-journal-x fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">Chưa có công thức</h5>
                  <p className="text-muted">
                    Công thức cho món này chưa được cập nhật vào hệ thống.
                  </p>
                </div>
              )}

              {/* Nutrition Info */}
              {item.nutritionInfo && (
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="bi bi-heart-pulse me-2"></i>
                      Thông tin dinh dưỡng (100g)
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-3">
                        <div className="border rounded p-3">
                          <div className="fs-5 fw-bold text-primary">
                            {item.nutritionInfo.calories}
                          </div>
                          <small className="text-muted">Calories</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border rounded p-3">
                          <div className="fs-5 fw-bold text-success">
                            {item.nutritionInfo.protein}g
                          </div>
                          <small className="text-muted">Protein</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border rounded p-3">
                          <div className="fs-5 fw-bold text-warning">
                            {item.nutritionInfo.carbs}g
                          </div>
                          <small className="text-muted">Carbs</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border rounded p-3">
                          <div className="fs-5 fw-bold text-info">
                            {item.nutritionInfo.fat}g
                          </div>
                          <small className="text-muted">Chất béo</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Đóng
              </button>
              <button type="button" className="btn btn-primary">
                <i className="bi bi-printer me-1"></i>
                In công thức
              </button>
              <button type="button" className="btn btn-outline-primary">
                <i className="bi bi-pencil me-1"></i>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default RecipeModal;
