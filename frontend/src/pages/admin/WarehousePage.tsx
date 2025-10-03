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

  // Modal states
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Helper function to format quantity display
  const formatQuantity = (quantity: number): string => {
    if (quantity % 1 === 0) {
      // Nếu là số nguyên, hiển thị không có phần thập phân
      return quantity.toString().replace(/\.?0+$/, '');
    } else {
      // Nếu có phần thập phân, loại bỏ số 0 thừa ở cuối
      return quantity.toString().replace(/\.?0+$/, '');
    }
  };

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
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Còn hàng</h6>
                  <h3 className="mb-0">{summary.in_stock_items}</h3>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card bg-warning text-dark">
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
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Hết hàng</h6>
                  <h3 className="mb-0">{summary.out_of_stock_items}</h3>
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
              <div className="d-flex justify-content-md-end gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="bi bi-funnel me-1"></i>
                  {showFilters ? 'Ẩn' : 'Hiện'} bộ lọc
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={clearFilters}
                  disabled={Object.keys(filters).length === 0 && !searchTerm}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
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
                      handleFilterChange('status', 'active');
                      handleFilterChange('low_stock', false);
                    } else if (e.target.value === 'low_stock') {
                      handleFilterChange('status', 'active');
                      handleFilterChange('low_stock', true);
                    } else if (e.target.value === 'out_of_stock') {
                      handleFilterChange('status', 'inactive');
                      handleFilterChange('low_stock', undefined);
                    } else {
                      handleFilterChange('status', undefined);
                      handleFilterChange('low_stock', undefined);
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
                        <span className="fw-bold">{formatQuantity(ingredient.stock_quantity || 0)}</span>
                      </td>
                      <td>{formatQuantity(ingredient.min_quantity || 0)}</td>
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