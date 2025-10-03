import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { inventoryApi } from '../../services/inventory';
import type { StockOut, StockHistoryFilters } from '../../types/inventory';
import { StockOutDetailModal } from '../../components/inventory';

const StockOutHistoryPage: React.FC = () => {
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ total_records: 0 });

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
  
  // Modal state
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<StockHistoryFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchStockOutHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getStockOutHistory(filters);
      setStockOuts(response.data);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải lịch sử xuất kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockOutHistory();
  }, [filters]);

  const handleSearch = () => {
    setFilters({ ...filters, ingredient_name: searchTerm });
  };

  const handleFilterChange = (key: keyof StockHistoryFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleRefresh = () => {
    fetchStockOutHistory();
  };

  const handleViewDetail = (stockOut: StockOut) => {
    setSelectedStockOut(stockOut);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedStockOut(null);
    setShowDetailModal(false);
  };

  const getReasonBadge = (reason: string, orderItem?: any) => {
    const isAutomatic = reason === 'cooking' && orderItem;
    
    if (isAutomatic) {
      return (
        <span className="badge bg-warning">
          <i className="bi bi-gear me-1"></i>
          Tự động (Nấu ăn)
        </span>
      );
    }
    
    switch (reason) {
      case 'expired':
        return (
          <span className="badge bg-danger">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Hết hạn
          </span>
        );
      case 'damaged':
        return (
          <span className="badge bg-secondary">
            <i className="bi bi-x-circle me-1"></i>
            Hỏng hóc
          </span>
        );
      case 'manual':
        return (
          <span className="badge bg-primary">
            <i className="bi bi-hand-index me-1"></i>
            Thủ công
          </span>
        );
      default:
        return (
          <span className="badge bg-info">
            <i className="bi bi-question-circle me-1"></i>
            Khác
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-danger" role="status">
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
            <i className="bi bi-arrow-up-circle me-2"></i>
            Lịch sử xuất kho
          </h2>
          <p className="text-muted mb-0">
            Xem chi tiết các lần xuất nguyên liệu khỏi kho
          </p>
        </div>

        <div className="d-flex gap-2">
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

      {/* Statistics Card */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Tổng số lần xuất kho</h6>
                  <h3 className="mb-0">{summary.total_records}</h3>
                </div>
                <div className="fs-1 opacity-75">
                  <i className="bi bi-arrow-up-circle"></i>
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
                  placeholder="Tìm kiếm theo tên nguyên liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  className="btn btn-danger" 
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
                <label className="form-label">Từ ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Đến ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Lý do xuất kho</label>
                <select
                  className="form-select"
                  value={filters.reason || ''}
                  onChange={(e) => handleFilterChange('reason', e.target.value || undefined)}
                >
                  <option value="">Tất cả</option>
                  <option value="cooking">Nấu ăn (Tự động)</option>
                  <option value="expired">Hết hạn</option>
                  <option value="damaged">Hỏng hóc</option>
                  <option value="manual">Thủ công</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock-Out History Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Lịch sử xuất kho
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nguyên liệu</th>
                  <th>Số lượng</th>
                  <th>Lý do</th>
                  <th>Người xuất</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {stockOuts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <i className="bi bi-arrow-up-circle fs-1 text-muted mb-3 d-block"></i>
                      <h5 className="text-muted">Chưa có lịch sử xuất kho</h5>
                      <p className="text-muted">Các giao dịch xuất kho sẽ hiển thị tại đây</p>
                    </td>
                  </tr>
                ) : (
                  stockOuts.map((stockOut) => (
                    <tr key={stockOut.id}>
                      <td>
                        <span className="fw-bold">#{stockOut.id}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-box text-muted me-2"></i>
                          <div>
                            <div className="fw-bold">{stockOut.ingredient.name}</div>
                            <small className="text-muted">{stockOut.ingredient.unit}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold">{formatQuantity(stockOut.quantity)} {stockOut.ingredient.unit}</span>
                      </td>
                      <td>
                        {getReasonBadge(stockOut.reason, stockOut.order_item)}
                        {stockOut.order_item && (
                          <div className="mt-1">
                            <small className="text-muted">
                              Đơn hàng: #{stockOut.order_item.order}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person text-muted me-2"></i>
                          <span>{stockOut.user.username}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar text-muted me-2"></i>
                          <span>{formatDate(stockOut.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleViewDetail(stockOut)}
                          title="Xem chi tiết"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Chi tiết
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

      {/* Stock Out Detail Modal */}
      <StockOutDetailModal
        isOpen={showDetailModal}
        stockOut={selectedStockOut}
        onClose={handleCloseDetailModal}
      />
    </AdminLayout>
  );
};

export default StockOutHistoryPage;