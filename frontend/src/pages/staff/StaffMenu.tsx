import React, { useState, useEffect } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import Loading from "../../components/shared/Loading";
import { menuApi } from "../../services/menu";
import type { Category, MenuItem } from "../../types/restaurant";

const StaffMenu: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filter states
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
    categories: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter effect
  useEffect(() => {
    filterItems();
  }, [searchName, selectedCategory, selectedStatus, menuItems]);

  // Load all data
  const loadData = async (showLoadingSpinner: boolean = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      
      const [categoriesRes, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getMenuItems()
      ]);

      if (categoriesRes.data.success && itemsRes.data.success) {
        const categoriesData = categoriesRes.data.data;
        const menuItemsData = itemsRes.data.data;
        
        setCategories(categoriesData);
        setMenuItems(menuItemsData);
        setFilteredItems(menuItemsData);
        
        // Calculate statistics
        const availableCount = menuItemsData.filter(item => item.status === "available").length;
        const unavailableCount = menuItemsData.filter(item => item.status === "unavailable").length;
        
        setStats({
          total: menuItemsData.length,
          available: availableCount,
          unavailable: unavailableCount,
          categories: categoriesData.length
        });
      } else {
        setError("Không thể tải dữ liệu menu");
      }
    } catch (err: any) {
      setError("Không thể tải dữ liệu menu");
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  // Filter items
  const filterItems = () => {
    const filtered = menuItems.filter((item: MenuItem) => {
      const matchesName = !searchName || item.name?.toLowerCase().includes(searchName.toLowerCase());
      const matchesCategory = !selectedCategory || item.category_id === Number(selectedCategory);
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesName && matchesCategory && matchesStatus;
    });
    setFilteredItems(filtered);
  };

  // Modal handlers
  const openDetailModal = (item: MenuItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Get category name
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Không có danh mục";
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <StaffLayout>
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Header */}
          <div className="row">
            <div className="col-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                <h2 className="mb-2 mb-md-0">
                  <i className="bi bi-journal-text me-2"></i>
                  Menu nhà hàng
                </h2>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => loadData()}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Messages */}
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
                      <h6 className="card-title">Tổng món ăn</h6>
                      <h3 className="mb-0">{stats.total}</h3>
                    </div>
                    <div className="fs-1 opacity-75">
                      <i className="bi bi-journal-text"></i>
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
                      <h6 className="card-title">Có sẵn</h6>
                      <h3 className="mb-0">{stats.available}</h3>
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
                      <h6 className="card-title">Không có sẵn</h6>
                      <h3 className="mb-0">{stats.unavailable}</h3>
                    </div>
                    <div className="fs-1 opacity-75">
                      <i className="bi bi-x-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Danh mục</h6>
                      <h3 className="mb-0">{stats.categories}</h3>
                    </div>
                    <div className="fs-1 opacity-75">
                      <i className="bi bi-list"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Tìm kiếm món ăn</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên món ăn..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Danh mục</label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="available">Có sẵn</option>
                    <option value="unavailable">Không có sẵn</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="row">
            {filteredItems.length === 0 ? (
              <div className="col-12">
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-journal-text text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="mt-3 text-muted">Không có món ăn nào</h5>
                    <p className="text-muted">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSearchName("");
                        setSelectedCategory("");
                        setSelectedStatus("");
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Xóa bộ lọc
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="card h-100 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => openDetailModal(item)}>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        className="card-img-top"
                        alt={item.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{item.name}</h5>
                        <span className={`badge ${item.status === 'available' ? 'bg-success' : 'bg-warning'}`}>
                          {item.status === 'available' ? 'Có sẵn' : 'Hết món'}
                        </span>
                      </div>
                      
                      <p className="text-muted small mb-2">
                        <i className="bi bi-list me-1"></i>
                        {getCategoryName(item.category_id)}
                      </p>
                      
                      {item.description && (
                        <p className="card-text text-muted small flex-grow-1">
                          {item.description.length > 100 
                            ? `${item.description.substring(0, 100)}...` 
                            : item.description}
                        </p>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <div className="h5 text-primary mb-0">
                          {formatPrice(item.price || 0)}
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailModal(item);
                          }}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail Modal */}
          {showDetailModal && selectedItem && (
            <div className="modal show d-block" tabIndex={-1}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="bi bi-info-circle me-2"></i>
                      Chi tiết món ăn
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDetailModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        {selectedItem.image_url ? (
                          <img
                            src={selectedItem.image_url}
                            className="img-fluid rounded"
                            alt={selectedItem.name}
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                            <i className="bi bi-image text-muted" style={{ fontSize: '4rem' }}></i>
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <h4 className="mb-3">{selectedItem.name}</h4>
                        
                        <div className="mb-3">
                          <strong>Danh mục:</strong>
                          <div className="mt-1">
                            <span className="badge bg-secondary">
                              {getCategoryName(selectedItem.category_id)}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <strong>Giá:</strong>
                          <div className="h4 text-primary mt-1">
                            {formatPrice(selectedItem.price || 0)}
                          </div>
                        </div>

                        <div className="mb-3">
                          <strong>Trạng thái:</strong>
                          <div className="mt-1">
                            <span className={`badge ${selectedItem.status === 'available' ? 'bg-success' : 'bg-warning'}`}>
                              {selectedItem.status === 'available' ? 'Có sẵn' : 'Hết món'}
                            </span>
                          </div>
                        </div>

                        {selectedItem.description && (
                          <div className="mb-3">
                            <strong>Mô tả:</strong>
                            <p className="mt-1 text-muted">{selectedItem.description}</p>
                          </div>
                        )}

                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted">
                              <strong>Ngày tạo:</strong><br />
                              {formatDate(selectedItem.created_at)}
                            </small>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">
                              <strong>Cập nhật:</strong><br />
                              {formatDate(selectedItem.updated_at)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDetailModal(false)}
                    >
                      <i className="bi bi-x me-1"></i>
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop show"></div>
            </div>
          )}
        </>
      )}
    </StaffLayout>
  );
};

export default StaffMenu;