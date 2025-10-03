import React, { useState, useEffect } from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import { inventoryApi } from '../../services/inventory';
import type { Ingredient, WarehouseFilters } from '../../types/inventory';

const StaffInventory: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ 
    total_ingredients: 0, 
    low_stock_items: 0,
    out_of_stock_items: 0,
    in_stock_items: 0 
  });
  
  // Filters
  const [filters, setFilters] = useState<WarehouseFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchWarehouse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getWarehouse(filters);
      setIngredients(response.data);
      
      // Tính toán thống kê
      const outOfStockItems = response.data.filter(item => item.stock_quantity === 0).length;
      const inStockItems = response.data.filter(item => item.stock_quantity > 0).length;
      
      setSummary({
        total_ingredients: response.summary.total_ingredients,
        low_stock_items: response.summary.low_stock_items,
        out_of_stock_items: outOfStockItems,
        in_stock_items: inStockItems
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, [filters]);

  const handleSearch = () => {
    setFilters({ ...filters, name: searchTerm });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const getStatusBadge = (ingredient: Ingredient) => {
    if (ingredient.status === 'inactive') {
      return <span className="badge bg-secondary">Không hoạt động</span>;
    }
    if (ingredient.is_low_stock) {
      return <span className="badge bg-warning text-dark">Sắp hết</span>;
    }
    return <span className="badge bg-success">Còn hàng</span>;
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-box me-2 text-primary"></i>
              Kho hàng
            </h2>
            <p className="text-muted mb-0">Xem thông tin tồn kho nguyên liệu</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={fetchWarehouse}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Làm mới
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Tổng nguyên liệu</h6>
                    <h3 className="card-title text-primary mb-0">{summary.total_ingredients}</h3>
                  </div>
                  <div className="text-primary">
                    <i className="bi bi-box-seam fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Còn hàng</h6>
                    <h3 className="card-title text-success mb-0">{summary.in_stock_items}</h3>
                  </div>
                  <div className="text-success">
                    <i className="bi bi-check-circle fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Sắp hết hàng</h6>
                    <h3 className="card-title text-warning mb-0">{summary.low_stock_items}</h3>
                  </div>
                  <div className="text-warning">
                    <i className="bi bi-exclamation-triangle fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Hết hàng</h6>
                    <h3 className="card-title text-danger mb-0">{summary.out_of_stock_items}</h3>
                  </div>
                  <div className="text-danger">
                    <i className="bi bi-x-circle fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm theo tên nguyên liệu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="btn btn-outline-secondary" onClick={handleSearch}>
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-4 d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="bi bi-funnel me-1"></i>
                  Bộ lọc
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleClearFilters}
                  disabled={!Object.keys(filters).length && !searchTerm}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Xóa bộ lọc
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="row g-3 mt-3 pt-3 border-top">
                <div className="col-md-6">
                  <label className="form-label">Trạng thái kho</label>
                  <select
                    className="form-select"
                    value={filters.status === 'active' && filters.low_stock === true ? 'low_stock' : 
                           filters.status === 'inactive' ? 'out_of_stock' :
                           filters.status === 'active' ? 'in_stock' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'in_stock') {
                        setFilters({ ...filters, status: 'active', low_stock: false });
                      } else if (e.target.value === 'low_stock') {
                        setFilters({ ...filters, status: 'active', low_stock: true });
                      } else if (e.target.value === 'out_of_stock') {
                        setFilters({ ...filters, status: 'inactive', low_stock: undefined });
                      } else {
                        setFilters({ ...filters, status: undefined, low_stock: undefined });
                      }
                    }}
                  >
                    <option value="">Tất cả</option>
                    <option value="in_stock">Còn hàng</option>
                    <option value="low_stock">Sắp hết hàng</option>
                    <option value="out_of_stock">Hết hàng</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Ingredients Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-light">
            <h5 className="card-title mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Danh sách nguyên liệu ({ingredients.length})
            </h5>
          </div>
          <div className="card-body p-0">
            {ingredients.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="text-muted mt-3">Không có nguyên liệu nào</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '5%' }}>#</th>
                      <th style={{ width: '25%' }}>Tên nguyên liệu</th>
                      <th style={{ width: '15%' }}>Đơn vị</th>
                      <th style={{ width: '15%' }}>Tồn kho</th>
                      <th style={{ width: '15%' }}>Ngưỡng tối thiểu</th>
                      <th style={{ width: '15%' }}>Giá/đơn vị</th>
                      <th style={{ width: '10%' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient, index) => (
                      <tr key={ingredient.id}>
                        <td className="text-muted">{index + 1}</td>
                        <td>
                          <div className="fw-medium">{ingredient.name}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {ingredient.unit}
                          </span>
                        </td>
                        <td>
                          <span className={`fw-bold ${ingredient.stock_quantity === 0 ? 'text-danger' : 'text-dark'}`}>
                            {ingredient.stock_quantity?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">
                            {ingredient.min_quantity?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td>
                          <span className="text-success fw-medium">
                            {ingredient.price_per_unit 
                              ? `${Math.round(ingredient.price_per_unit).toLocaleString('vi-VN')} đ`
                              : 'Chưa có'
                            }
                          </span>
                        </td>
                        <td>
                          {getStatusBadge(ingredient)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffInventory;