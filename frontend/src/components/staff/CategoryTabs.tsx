import React from "react";
import type { MenuCategory } from "../../types/menu";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategory: number;
  onCategoryChange: (categoryId: number) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const activeCategoryInfo = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="mb-4">
      {/* Category Navigation */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          className={`btn ${
            activeCategory === 0 ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => onCategoryChange(0)}
        >
          <i className="bi bi-grid-3x3 me-2"></i>
          Tất cả danh mục
        </button>

        {categories
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(category => (
            <button
              key={category.id}
              className={`btn ${
                activeCategory === category.id
                  ? "btn-primary"
                  : "btn-outline-primary"
              } ${!category.isActive ? "opacity-50" : ""}`}
              onClick={() => onCategoryChange(category.id)}
              disabled={!category.isActive}
            >
              <i className={`${category.icon} me-2`}></i>
              {category.name}
              {!category.isActive && (
                <i className="bi bi-pause-circle ms-2 text-warning"></i>
              )}
            </button>
          ))}
      </div>

      {/* Category Description */}
      {activeCategoryInfo && activeCategory !== 0 && (
        <div className="alert alert-info mb-3">
          <div className="d-flex align-items-center">
            <i className={`${activeCategoryInfo.icon} fs-4 me-3`}></i>
            <div>
              <h6 className="mb-1">{activeCategoryInfo.name}</h6>
              {activeCategoryInfo.description && (
                <p className="mb-0 small">{activeCategoryInfo.description}</p>
              )}
            </div>
            <div className="ms-auto">
              <span
                className={`badge ${
                  activeCategoryInfo.isActive ? "bg-success" : "bg-warning"
                }`}
              >
                {activeCategoryInfo.isActive ? "Đang hoạt động" : "Tạm ngưng"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;
