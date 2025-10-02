import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { inventoryApi } from '../../services/inventory';
import type { Ingredient, WarehouseFilters } from '../../types/inventory';
import StockInModal from '../../components/inventory/StockInModal';
import StockOutModal from '../../components/inventory/StockOutModal';
import EditIngredientModal from '../../components/inventory/EditIngredientModal';
// @ts-ignore
import { useNotification } from '../../contexts/NotificationContext';

const WarehousePage: React.FC = () => {
  const { showNotification } = useNotification();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total_ingredients: 0, low_stock_items: 0 });
  
  // Filters
  const [filters, setFilters] = useState<WarehouseFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const fetchWarehouse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getWarehouse(filters);
      setIngredients(response.data);
      setSummary(response.summary);
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

  const handleFilterChange = (key: keyof WarehouseFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleRefresh = () => {
    fetchWarehouse();
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string, isLowStock: boolean) => {
    // Ưu tiên kiểm tra status trước (hết hàng hoàn toàn)
    if (status === 'inactive') {
      return (
        <span className="badge bg-secondary">
          <i className="bi bi-x-circle me-1"></i>
          Hết hàng
        </span>
      );
    }
    
    // Sau đó kiểm tra sắp hết (còn hàng nhưng dưới mức tối thiểu)
    if (isLowStock) {
      return (
        <span className="badge bg-warning">
          <i className="bi bi-exclamation-triangle me-1"></i>
          Sắp hết
        </span>
      );
    }
    
    // Còn hàng bình thường
    return (
      <span className="badge bg-success">
        <i className="bi bi-check-circle me-1"></i>
        Còn hàng
      </span>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-box me-2"></i>
            Quản lý kho
          </h2>
          <p className="text-muted mb-0">
            Theo dõi và quản lý nguyên liệu, tồn kho
          </p>
        </div>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-success"
            onClick={() => setShowStockInModal(true)}
          >
            <i className="bi bi-plus me-1"></i>
            Nhập kho
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setShowStockOutModal(true)}
          >
            <i className="bi bi-dash me-1"></i>
            Xuất kho
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Tổng nguyên liệu</h6>
                  <h3 className="mb-0">{summary.total_ingredients}</h3>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-box"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Sắp hết hàng</h6>
                  <h3 className="mb-0">{summary.low_stock_items}</h3>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Còn hàng</h6>
                  <h3 className="mb-0">
                    {ingredients.filter(i => i.status === 'active' && !i.is_low_stock).length}
                  </h3>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Hết hàng</h6>
                  <h3 className="mb-0">
                    {ingredients.filter(i => i.status === 'inactive').length}
                  </h3>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-x-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm nguyên liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="bi bi-funnel me-1"></i>
                  Bộ lọc
                </button>
                {Object.keys(filters).length > 0 && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="row g-3 mt-3 pt-3 border-top">
              <div className="col-md-4">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <option value="">Tất cả</option>
                  <option value="active">Còn hàng</option>
                  <option value="inactive">Hết hàng</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Tình trạng tồn kho</label>
                <select
                  className="form-select"
                  value={filters.low_stock ? 'true' : ''}
                  onChange={(e) => handleFilterChange('low_stock', e.target.value === 'true' || undefined)}
                >
                  <option value="">Tất cả</option>
                  <option value="true">Sắp hết hàng</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Danh sách nguyên liệu
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nguyên liệu</th>
                  <th>Đơn vị</th>
                  <th>Tồn kho</th>
                  <th>Mức tối thiểu</th>
                  <th>Giá/đơn vị</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <i className="bi bi-box fs-1 text-muted mb-3 d-block"></i>
                      <h5 className="text-muted">Không có nguyên liệu nào</h5>
                      <p className="text-muted">Vui lòng thêm nguyên liệu mới</p>
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ingredient) => (
                    <tr key={ingredient.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{ingredient.name}</div>
                          <small className="text-muted">ID: {ingredient.id}</small>
                        </div>
                      </td>
                      <td>{ingredient.unit}</td>
                      <td>
                        <span className="fw-bold">{ingredient.stock_quantity}</span>
                      </td>
                      <td>{ingredient.min_quantity}</td>
                      <td>{formatCurrency(ingredient.price_per_unit)}</td>
                      <td>{getStatusBadge(ingredient.status, ingredient.is_low_stock)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditIngredient(ingredient)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StockInModal
        isOpen={showStockInModal}
        onClose={() => setShowStockInModal(false)}
        onSuccess={() => {
          fetchWarehouse();
          showNotification('Nhập kho thành công!', 'success');
        }}
      />

      <StockOutModal
        isOpen={showStockOutModal}
        onClose={() => setShowStockOutModal(false)}
        onSuccess={() => {
          fetchWarehouse();
          showNotification('Xuất kho thành công!', 'success');
        }}
      />

      <EditIngredientModal
        isOpen={showEditModal}
        ingredient={selectedIngredient}
        onClose={() => {
          setShowEditModal(false);
          setSelectedIngredient(null);
        }}
        onSuccess={() => {
          fetchWarehouse();
          setShowEditModal(false);
          setSelectedIngredient(null);
          showNotification('Cập nhật nguyên liệu thành công!', 'success');
        }}
      />
    </AdminLayout>
  );
};

export default WarehousePage;