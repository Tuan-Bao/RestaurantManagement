import React, { useState, useEffect } from 'react';
import { menuApi } from '../../services/menu';
import { ordersApi } from '../../services/orders';
import type { MenuItem, Category, Order, OrderItem } from '../../types/restaurant';
// @ts-ignore
import { useNotification } from '../../contexts/NotificationContext';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note: string;
}

interface MenuSelectionProps {
  isOpen: boolean;
  tableId: number;
  tableName: string;
  onClose: () => void;
  onOrderCreated: () => void;
}

const MenuSelection: React.FC<MenuSelectionProps> = ({
  isOpen,
  tableId,
  tableName,
  onClose,
  onOrderCreated,
}) => {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemNote, setItemNote] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);

  // Format price helper function
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(price)) + 'đ';
  };

  useEffect(() => {
    if (isOpen) {
      loadMenuData();
      checkExistingOrder();
    }
  }, [isOpen]);

  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, searchTerm]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load categories and menu items
      const [categoriesRes, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getMenuItems({ status: 'available' })
      ]);

      if (categoriesRes.data.success && itemsRes.data.success) {
        setCategories(categoriesRes.data.data);
        setMenuItems(itemsRes.data.data);
      } else {
        setError('Không thể tải dữ liệu menu');
      }
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Có lỗi xảy ra khi tải menu');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingOrder = async () => {
    try {
      const response = await ordersApi.getOrderByTable(tableId);
      if (response.data.success && response.data.data) {
        setExistingOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error checking existing order:', error);
    }
  };

  const filterItems = () => {
    let filtered = menuItems.filter(item => item.status === 'available');

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const getItemQuantityInCart = (itemId: number): number => {
    const cartItem = cart.find(item => item.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  const getExistingItemQuantity = (itemId: number): number => {
    if (!existingOrder?.order_items) return 0;
    
    const existingItem = existingOrder.order_items.find(
      orderItem => orderItem.menu_item_id === itemId && orderItem.status === 'ordered'
    );
    
    return existingItem?.quantity || 0;
  };

  const addToCart = (menuItem: MenuItem, quantity: number = 1, note: string = '') => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.menuItem.id === menuItem.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity,
          note: note || newCart[existingIndex].note
        };
        return newCart;
      } else {
        // Add new item
        return [...prev, { menuItem, quantity, note }];
      }
    });
  };

  const updateCartItem = (itemId: number, quantity: number, note?: string) => {
    setCart(prev => prev.map(item => 
      item.menuItem.id === itemId 
        ? { ...item, quantity, note: note !== undefined ? note : item.note }
        : item
    ));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getTotalQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleItemClick = (menuItem: MenuItem) => {
    setSelectedItem(menuItem);
    setItemNote('');
    setItemQuantity(1);
  };

  const handleAddItemWithNote = () => {
    if (selectedItem) {
      addToCart(selectedItem, itemQuantity, itemNote);
      setSelectedItem(null);
      setItemNote('');
      setItemQuantity(1);
    }
  };

  const mergeOrderItems = (
    existingItems: Array<{ menu_item: number; quantity: number; note: string }>,
    newItems: Array<{ menu_item: number; quantity: number; note: string }>
  ) => {
    // Tạo map để merge items theo menu_item_id
    const itemsMap = new Map<number, { menu_item: number; quantity: number; note: string }>();

    // Thêm tất cả món hiện có (status = 'ordered')
    existingItems.forEach(item => {
      itemsMap.set(item.menu_item, {
        menu_item: item.menu_item,
        quantity: item.quantity,
        note: item.note
      });
    });

    // Merge với món mới từ cart
    newItems.forEach(newItem => {
      const existingItem = itemsMap.get(newItem.menu_item);
      
      if (existingItem) {
        // Nếu món đã tồn tại, cộng dồn số lượng và cập nhật ghi chú
        itemsMap.set(newItem.menu_item, {
          menu_item: newItem.menu_item,
          quantity: existingItem.quantity + newItem.quantity,
          note: newItem.note || existingItem.note // Ưu tiên ghi chú mới
        });
      } else {
        // Món mới hoàn toàn
        itemsMap.set(newItem.menu_item, newItem);
      }
    });

    // Chuyển map thành array
    return Array.from(itemsMap.values());
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      showNotification('Vui lòng chọn ít nhất một món', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const itemsData = cart.map(item => ({
        menu_item: item.menuItem.id,
        quantity: item.quantity,
        note: item.note
      }));

      let response;
      
      if (existingOrder) {
        const existingOrderedItems = existingOrder.order_items
          ?.filter(item => item.status === 'ordered')
          .map(item => ({
            menu_item: item.menu_item,
            quantity: item.quantity,
            note: item.note || ''
          })) || [];

        const mergedItems = mergeOrderItems(existingOrderedItems, itemsData);
        response = await ordersApi.updateOrderItems(existingOrder.id, mergedItems);
      } else {
        const orderData = {
          table: tableId,
          items: itemsData
        };
        response = await ordersApi.createOrder(orderData);
      }
      
      if (response.data.success) {
        setCart([]);
        onOrderCreated();
        onClose();
        showNotification(
          existingOrder ? 'Đã thêm món vào đơn hàng' : 'Đặt món thành công', 
          'success'
        );
      } else {
        showNotification('Không thể xử lý đơn hàng. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      showNotification('Có lỗi xảy ra khi xử lý đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex={-1}>
        <div className="modal-dialog" style={{ maxWidth: '1200px', width: '95vw' }}>
          <div className="modal-content" style={{ height: '85vh', minHeight: '600px' }}>
            <div className="modal-header border-bottom flex-shrink-0">
              <h5 className="modal-title">
                <i className="bi bi-cart-plus me-2"></i>
                Đặt món - {tableName}
                {existingOrder && (
                  <span className="badge bg-info ms-2">
                    Cập nhật đơn hàng
                  </span>
                )}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-0 d-flex flex-column flex-grow-1" style={{ overflow: 'hidden' }}>
              {!showCart ? (
                <>
                  {/* Search and Categories */}
                  <div className="bg-light p-3 border-bottom sticky-top">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm món ăn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Tabs */}
                    <div className="mt-3">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setSelectedCategory('all')}
                        >
                          <i className="bi bi-grid-3x3-gap me-1"></i>
                          Tất cả
                        </button>
                        {categories.map(category => (
                          <button
                            key={category.id}
                            className={`btn btn-sm ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', paddingBottom: '80px' }}>
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                      </div>
                    ) : (
                      <div className="row g-3">
                        {filteredItems.map(item => {
                          const quantityInCart = getItemQuantityInCart(item.id);
                          const existingQuantity = getExistingItemQuantity(item.id);
                          const totalQuantity = quantityInCart + existingQuantity;
                          
                          return (
                            <div key={item.id} className="col-lg-6 col-md-12 col-sm-12 mb-3">
                              <div className="card shadow-sm border-0" style={{ height: '200px' }}>
                                <div className="row g-0 h-100">
                                  {/* Image Column */}
                                  <div className="col-4 position-relative">
                                    <img
                                      src={item.image_url || '/images/default-food.jpg'}
                                      className="img-fluid h-100 w-100"
                                      alt={item.name}
                                      style={{ objectFit: 'cover', borderRadius: '0.375rem 0 0 0.375rem' }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x180?text=No+Image";
                                      }}
                                    />
                                    {totalQuantity > 0 && (
                                      <div className="position-absolute top-0 start-0 p-2">
                                        <span className="badge bg-primary fs-6 shadow">
                                          {totalQuantity}
                                        </span>
                                        {existingQuantity > 0 && quantityInCart > 0 && (
                                          <div className="small text-white mt-1 bg-dark bg-opacity-75 rounded px-1">
                                            <small>Có: {existingQuantity} + Mới: {quantityInCart}</small>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Content Column */}
                                  <div className="col-8">
                                    <div className="card-body d-flex flex-column h-100 p-3">
                                      {/* Title Section - Fixed Height */}
                                      <div style={{ height: '80px', overflow: 'hidden' }}>
                                        <h6 className="card-title fw-bold mb-2" 
                                            style={{ 
                                              fontSize: '1.1rem',
                                              lineHeight: '1.3',
                                              height: '2.6rem',
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden'
                                            }} 
                                            title={item.name}>
                                          {item.name}
                                        </h6>
                                        <p className="card-text text-muted small mb-0" 
                                           style={{ 
                                             display: '-webkit-box',
                                             WebkitLineClamp: 2,
                                             WebkitBoxOrient: 'vertical',
                                             overflow: 'hidden',
                                             lineHeight: '1.3',
                                             height: '2.6rem',
                                             fontSize: '0.85rem'
                                           }}
                                           title={item.description || 'Không có mô tả'}>
                                          {item.description || 'Không có mô tả'}
                                        </p>
                                      </div>
                                      
                                      {/* Price Section - Fixed Height */}
                                      <div className="mt-auto" style={{ height: '80px' }}>
                                        <div className="text-center mb-3">
                                          <span className="fw-bold text-primary" style={{ fontSize: '1.3rem' }}>
                                            {formatPrice(item.price)}
                                          </span>
                                        </div>
                                        
                                        {/* Actions Row - Fixed Height */}
                                        <div className="d-flex justify-content-center gap-2">
                                          {/* Quantity Control */}
                                          {quantityInCart > 0 ? (
                                            <>
                                              <div className="btn-group btn-group-sm" role="group">
                                                <button
                                                  className="btn btn-outline-warning"
                                                  onClick={() => {
                                                    if (quantityInCart === 1) {
                                                      removeFromCart(item.id);
                                                    } else {
                                                      updateCartItem(item.id, quantityInCart - 1);
                                                    }
                                                  }}
                                                  title="Giảm số lượng"
                                                >
                                                  <i className="bi bi-dash"></i>
                                                </button>
                                                <span className="btn btn-outline-secondary disabled" style={{ minWidth: '40px' }}>
                                                  {quantityInCart}
                                                </span>
                                                <button
                                                  className="btn btn-outline-success"
                                                  onClick={() => addToCart(item, 1)}
                                                  title="Tăng số lượng"
                                                >
                                                  <i className="bi bi-plus"></i>
                                                </button>
                                              </div>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleItemClick(item)}
                                                title="Xem chi tiết"
                                              >
                                                <i className="bi bi-info-circle"></i>
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => addToCart(item, 1)}
                                                title="Thêm vào giỏ"
                                              >
                                                <i className="bi bi-plus-circle me-1"></i>
                                                Thêm
                                              </button>
                                              <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleItemClick(item)}
                                                title="Xem chi tiết"
                                              >
                                                <i className="bi bi-info-circle"></i>
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {filteredItems.length === 0 && !loading && !error && (
                      <div className="text-center py-5">
                        <div className="mb-4">
                          <i className="bi bi-search fs-1 text-muted"></i>
                        </div>
                        <h5 className="text-muted mb-2">Không tìm thấy món ăn nào</h5>
                        <p className="text-muted mb-3">
                          {searchTerm || selectedCategory !== 'all' 
                            ? 'Thử thay đổi từ khóa tìm kiếm hoặc danh mục'
                            : 'Hiện tại chưa có món ăn nào trong menu'
                          }
                        </p>
                        {(searchTerm || selectedCategory !== 'all') && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('all');
                            }}
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Cart View - ĐÃ ĐƠN GIẢN HÓA: BỎ PHẦN HIỂN THỊ MÓN CŨ */
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-cart me-2"></i>
                      Giỏ hàng ({getTotalQuantity()} món)
                    </h6>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowCart(false)}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Trở về menu
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
                      <h5 className="text-muted">Giỏ hàng trống</h5>
                      <p className="text-muted">Vui lòng chọn món từ menu</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table">
                          <thead className="table-light">
                            <tr>
                              <th>Món ăn</th>
                              <th className="text-center">Số lượng</th>
                              <th className="text-end">Đơn giá</th>
                              <th className="text-end">Thành tiền</th>
                              <th className="text-center">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cart.map(item => (
                              <tr key={item.menuItem.id}>
                                <td>
                                  <div>
                                    <strong>{item.menuItem.name}</strong>
                                    {item.note && (
                                      <div>
                                        <small className="text-muted">
                                          <i className="bi bi-sticky me-1"></i>
                                          {item.note}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="text-center">
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() => {
                                        if (item.quantity === 1) {
                                          removeFromCart(item.menuItem.id);
                                        } else {
                                          updateCartItem(item.menuItem.id, item.quantity - 1);
                                        }
                                      }}
                                    >
                                      <i className="bi bi-dash"></i>
                                    </button>
                                    <span className="btn btn-outline-secondary disabled">
                                      {item.quantity}
                                    </span>
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() => updateCartItem(
                                        item.menuItem.id,
                                        item.quantity + 1
                                      )}
                                    >
                                      <i className="bi bi-plus"></i>
                                    </button>
                                  </div>
                                </td>
                                <td className="text-end">
                                  {formatPrice(item.menuItem.price)}
                                </td>
                                <td className="text-end">
                                  <strong>
                                    {formatPrice(item.menuItem.price * item.quantity)}
                                  </strong>
                                </td>
                                <td className="text-center">
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeFromCart(item.menuItem.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan={3}><strong>Tổng cộng:</strong></td>
                              <td className="text-end">
                                <strong className="fs-5 text-primary">
                                  {formatPrice(getTotalAmount())}
                                </strong>
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowCart(false)}
                        >
                          <i className="bi bi-arrow-left me-1"></i>
                          Trở về
                        </button>
                        <button
                          className="btn btn-primary flex-grow-1"
                          onClick={handleCreateOrder}
                          disabled={loading || cart.length === 0}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check me-1"></i>
                              {existingOrder ? 'Thêm món vào đơn hàng' : 'Xác nhận đặt món'}
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Cart Summary Fixed Bottom */}
              {!showCart && cart.length > 0 && (
                <div 
                  className="position-fixed bottom-0 start-0 end-0 bg-success text-white p-3 rounded-top-3"
                  style={{ zIndex: 1050, cursor: 'pointer' }}
                  onClick={() => setShowCart(true)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-cart me-2"></i>
                      Giỏ hàng: {getTotalQuantity()} món
                    </div>
                    <div className="fw-bold">
                      {formatPrice(getTotalAmount())}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm món vào giỏ hàng</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedItem(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <img
                    src={selectedItem.image_url || '/images/default-food.jpg'}
                    alt={selectedItem.name}
                    className="img-fluid rounded mb-3"
                    style={{ maxHeight: '200px' }}
                  />
                  <h5>{selectedItem.name}</h5>
                  <p className="text-muted">{selectedItem.description}</p>
                  <div className="fs-4 fw-bold text-primary">
                    {formatPrice(selectedItem.price)}
                  </div>
                  
                  {/* Hiển thị thông tin món đã có trong order */}
                  {getExistingItemQuantity(selectedItem.id) > 0 && (
                    <div className="alert alert-info mt-3">
                      <small>
                        <i className="bi bi-info-circle me-1"></i>
                        Đã có {getExistingItemQuantity(selectedItem.id)} món này trong đơn hàng
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Số lượng:</label>
                  <div className="btn-group w-100">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className="btn btn-outline-secondary disabled flex-grow-1">
                      {itemQuantity}
                    </span>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú:</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Ghi chú đặc biệt cho món ăn..."
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedItem(null)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddItemWithNote}
                >
                  <i className="bi bi-cart-plus me-1"></i>
                  Thêm vào giỏ ({itemQuantity} x {formatPrice(selectedItem.price)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="modal-backdrop show"></div>
    </>
  );
};

export default MenuSelection;