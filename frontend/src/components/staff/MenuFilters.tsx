import React, { useState } from "react";
import type { MenuItem } from "../../types/menu";

interface MenuFiltersProps {
  items: MenuItem[];
  onFilteredItemsChange: (items: MenuItem[]) => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  items,
  onFilteredItemsChange,
}) => {
  const [filters, setFilters] = useState({
    search: "",
    availability: "all", // all, available, unavailable
    sortBy: "name", // name, price-low, price-high, popular, time
    tags: [] as string[],
  });

  const applyFilters = React.useCallback(
    (newFilters = filters) => {
      let filtered = [...items];

      // Filter by search (name, description, ingredients)
      if (newFilters.search.trim()) {
        const searchLower = newFilters.search.toLowerCase().trim();
        filtered = filtered.filter(
          item =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            item.ingredients.some(ing =>
              ing.toLowerCase().includes(searchLower)
            ) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Filter by availability
      if (newFilters.availability === "available") {
        filtered = filtered.filter(item => item.isAvailable);
      } else if (newFilters.availability === "unavailable") {
        filtered = filtered.filter(item => !item.isAvailable);
      }

      // Filter by tags
      if (newFilters.tags.length > 0) {
        filtered = filtered.filter(item =>
          newFilters.tags.some(tag => item.tags.includes(tag))
        );
      }

      // Sort items
      if (newFilters.sortBy === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (newFilters.sortBy === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (newFilters.sortBy === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (newFilters.sortBy === "popular") {
        filtered.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return a.name.localeCompare(b.name);
        });
      } else if (newFilters.sortBy === "time") {
        filtered.sort((a, b) => a.preparationTime - b.preparationTime);
      }

      onFilteredItemsChange(filtered);
    },
    [items, onFilteredItemsChange, filters]
  );

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange("tags", newTags);
  };

  // Apply initial filters
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getMenuStats = () => {
    const available = items.filter(i => i.isAvailable).length;
    const unavailable = items.filter(i => !i.isAvailable).length;
    const popular = items.filter(i => i.isPopular).length;
    const avgPrice = items.reduce((sum, i) => sum + i.price, 0) / items.length;

    return { available, unavailable, popular, total: items.length, avgPrice };
  };

  // Get all unique tags from items
  const getAllTags = () => {
    const allTags = items.flatMap(item => item.tags);
    return [...new Set(allTags)].sort();
  };

  const stats = getMenuStats();
  const availableTags = getAllTags();

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-funnel me-2"></i>
          Bộ lọc và thống kê thực đơn
        </h6>
      </div>
      <div className="card-body">
        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded p-3 me-3">
                <i className="bi bi-journal-text fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">{stats.total}</h5>
                <small className="text-muted">Tổng món ăn</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-success text-white rounded p-3 me-3">
                <i className="bi bi-check-circle fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">{stats.available}</h5>
                <small className="text-muted">Có sẵn</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-warning text-white rounded p-3 me-3">
                <i className="bi bi-star-fill fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">{stats.popular}</h5>
                <small className="text-muted">Món phổ biến</small>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-info text-white rounded p-3 me-3">
                <i className="bi bi-currency-dollar fs-4"></i>
              </div>
              <div>
                <h5 className="mb-0">
                  {Math.round(stats.avgPrice).toLocaleString("vi-VN")}đ
                </h5>
                <small className="text-muted">Giá trung bình</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="row mb-3">
          <div className="col-md-4 mb-3">
            <label className="form-label">
              <i className="bi bi-search me-1"></i>
              Tìm kiếm
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Tên món, mô tả, nguyên liệu..."
              value={filters.search}
              onChange={e => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="col-md-3 mb-3">
            <label className="form-label">
              <i className="bi bi-flag me-1"></i>
              Trạng thái
            </label>
            <select
              className="form-select"
              value={filters.availability}
              onChange={e => handleFilterChange("availability", e.target.value)}
              aria-label="Lọc theo trạng thái món ăn"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Có sẵn ({stats.available})</option>
              <option value="unavailable">Hết món ({stats.unavailable})</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label className="form-label">
              <i className="bi bi-sort-down me-1"></i>
              Sắp xếp theo
            </label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={e => handleFilterChange("sortBy", e.target.value)}
              aria-label="Sắp xếp món ăn theo"
            >
              <option value="name">Tên A-Z</option>
              <option value="price-low">Giá thấp → cao</option>
              <option value="price-high">Giá cao → thấp</option>
              <option value="popular">Món phổ biến</option>
              <option value="time">Thời gian chuẩn bị</option>
            </select>
          </div>

          <div className="col-md-2 mb-3 d-flex align-items-end">
            {(filters.search ||
              filters.availability !== "all" ||
              filters.tags.length > 0) && (
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  const resetFilters = {
                    search: "",
                    availability: "all",
                    sortBy: "name",
                    tags: [],
                  };
                  setFilters(resetFilters);
                  applyFilters(resetFilters);
                }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div>
            <label className="form-label">
              <i className="bi bi-tags me-1"></i>
              Lọc theo thẻ:
            </label>
            <div className="d-flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  className={`btn btn-sm ${
                    filters.tags.includes(tag)
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {filters.tags.includes(tag) && (
                    <i className="bi bi-x ms-1"></i>
                  )}
                </button>
              ))}
              {availableTags.length > 10 && (
                <small className="text-muted align-self-center">
                  +{availableTags.length - 10} thẻ khác...
                </small>
              )}
            </div>
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
          <button
            className={`btn btn-sm ${
              filters.availability === "available"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() =>
              handleFilterChange(
                "availability",
                filters.availability === "available" ? "all" : "available"
              )
            }
          >
            <i className="bi bi-check-circle me-1"></i>
            Có sẵn ({stats.available})
          </button>

          <button
            className={`btn btn-sm ${
              filters.availability === "unavailable"
                ? "btn-danger"
                : "btn-outline-danger"
            }`}
            onClick={() =>
              handleFilterChange(
                "availability",
                filters.availability === "unavailable" ? "all" : "unavailable"
              )
            }
          >
            <i className="bi bi-pause-circle me-1"></i>
            Hết món ({stats.unavailable})
          </button>

          <button
            className={`btn btn-sm ${
              filters.sortBy === "popular"
                ? "btn-warning"
                : "btn-outline-warning"
            }`}
            onClick={() =>
              handleFilterChange(
                "sortBy",
                filters.sortBy === "popular" ? "name" : "popular"
              )
            }
          >
            <i className="bi bi-star-fill me-1"></i>
            Món phổ biến ({stats.popular})
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuFilters;
