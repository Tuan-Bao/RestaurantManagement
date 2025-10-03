import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../services/orders';
import ConfirmDialog from './ConfirmDialog';
import type { Table, Order, OrderItem } from '../../types/restaurant';
import { tablesApi } from '../../services/tables';
// @ts-ignore
import { useNotification } from '../../contexts/NotificationContext';

interface TableOrderModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: () => void;
  onPayment: () => void;
  onCloseTable?: () => void;
  onTableChanged?: () => void;
}

const TableOrderModal: React.FC<TableOrderModalProps> = ({
  table,
  isOpen,
  onClose,
  onAddOrder,
  onPayment,
  onCloseTable,
  onTableChanged,
}) => {
  const { showNotification } = useNotification();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<OrderItem | null>(null);
  const [showTableChangeModal, setShowTableChangeModal] = useState(false);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [selectedTargetTable, setSelectedTargetTable] = useState<number | null>(null);
  
  // Load order data when modal opens
  useEffect(() => {
    if (isOpen && table) {
      loadOrderData();
    }
  }, [isOpen, table]);

  const loadOrderData = async () => {
    if (!table) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ordersApi.getOrderByTable(table.id);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('Không thể tải thông tin đơn hàng');
      }
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Có lỗi xảy ra khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleItemStatusChange = async (itemId: number, newStatus: OrderItem['status']) => {
    try {
      const response = await ordersApi.updateOrderItemStatus(itemId, newStatus);
      if (response.data.success) {
        await loadOrderData();
        showNotification('Cập nhật trạng thái thành công', 'success');
      } else {
        showNotification('Không thể cập nhật trạng thái món ăn', 'error');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      showNotification('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteItem = (item: OrderItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await ordersApi.deleteOrderItem(itemToDelete.id);
      
      if (response.status === 204 || (response.data && response.data.success)) {
        await loadOrderData();
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        showNotification('Xóa món thành công', 'success');
      } else {
        showNotification('Không thể xóa món ăn', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      
      if (error.response?.status === 204) {
        await loadOrderData();
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        showNotification('Xóa món thành công', 'success');
      } else {
        showNotification('Có lỗi xảy ra khi xóa món ăn', 'error');
      }
    }
  };

  const loadAvailableTables = async () => {
    try {
      const response = await tablesApi.getTables({ status: 'available' });
      if (response.data.success) {
        // Loại bỏ bàn hiện tại khỏi danh sách
        const tables = response.data.data.filter(t => t.id !== table?.id);
        setAvailableTables(tables);
      }
    } catch (error) {
      console.error('Error loading available tables:', error);
    }
  };

  const handleTableChangeClick = () => {
    loadAvailableTables();
    setShowTableChangeModal(true);
  };

  const handleTableChange = async () => {
    if (!table || !selectedTargetTable) return;

    try {
      const response = await tablesApi.changeTable({
        from_table_id: table.id,
        to_table_id: selectedTargetTable
      });

      if (response.data.success) {
        setShowTableChangeModal(false);
        setSelectedTargetTable(null);
        if (onTableChanged) {
          onTableChanged();
        }
        showNotification('Chuyển bàn thành công!', 'success');
        onClose();
      } else {
        showNotification('Không thể chuyển bàn. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Error changing table:', error);
      showNotification('Có lỗi xảy ra khi chuyển bàn', 'error');
    }
  };

  if (!isOpen || !table) return null;

  const getStatusBadge = (status: OrderItem['status']) => {
    const statusConfig = {
      ordered: { color: 'warning', text: 'Đã đặt' },
      cooking: { color: 'info', text: 'Đang nấu' },
      done: { color: 'success', text: 'Hoàn thành' },
      cancel: { color: 'danger', text: 'Đã hủy' }
    };
    return statusConfig[status] || statusConfig.ordered;
  };

  const totalAmount = order?.order_items?.reduce((sum, item) => sum + (item.quantity * item.price_each), 0) || 0;

  return (
    <>
      <div className="modal show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-grid-3x3 me-2"></i>
                {table.name} - Chi tiết đơn hàng
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {/* Table Info */}
              <div className="alert alert-info mb-3">
                <div className="row">
                  <div className="col-6">
                    <strong>Tầng:</strong> {table.floor}
                  </div>
                  <div className="col-6">
                    <strong>Trạng thái:</strong> 
                    <span className="badge bg-danger ms-2">
                      Đang phục vụ
                    </span>
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Orders List */}
              {!loading && !error && (
                <>
                  {order && order.order_items && order.order_items.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Món ăn</th>
                            <th className="text-center">SL</th>
                            <th className="text-end">Đơn giá</th>
                            <th className="text-end">Thành tiền</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.order_items.map(item => {
                            const statusInfo = getStatusBadge(item.status);
                            const itemTotal = item.quantity * item.price_each;
                            return (
                              <tr key={item.id}>
                                <td>
                                  <div>
                                    <strong>
                                      {item.menu_item_name || `Menu Item ID: ${item.menu_item}`}
                                    </strong>
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
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">
                                  {item.price_each.toLocaleString('vi-VN')}đ
                                </td>
                                <td className="text-end">
                                  <strong>
                                    {itemTotal.toLocaleString('vi-VN')}đ
                                  </strong>
                                </td>
                                <td className="text-center">
                                  <span className={`badge bg-${statusInfo.color}`}>
                                    {statusInfo.text}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <div className="btn-group">
                                    {/* Status change buttons */}
                                    {item.status === 'ordered' && (
                                      <>
                                        {/* <button
                                          className="btn btn-sm btn-outline-info"
                                          onClick={() => handleItemStatusChange(item.id, 'cooking')}
                                          title="Bắt đầu nấu"
                                        >
                                          <i className="bi bi-play"></i>
                                        </button> */}
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDeleteItem(item)}
                                          title="Xóa món"
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </>
                                    )}
                                    {/* {item.status === 'cooking' && (
                                      <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => handleItemStatusChange(item.id, 'done')}
                                        title="Hoàn thành"
                                      >
                                        <i className="bi bi-check"></i>
                                      </button>
                                    )} */}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={3}><strong>Tổng cộng:</strong></td>
                            <td className="text-end">
                              <strong className="fs-5 text-primary">
                                {totalAmount.toLocaleString('vi-VN')}đ
                              </strong>
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
                      <p className="text-muted">Chưa có món nào được đặt</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Đóng
              </button>
              
              <button
                type="button"
                className="btn btn-success"
                onClick={onAddOrder}
              >
                <i className="bi bi-plus me-1"></i>
                Đặt món
              </button>

              {order && order.order_items && order.order_items.length > 0 ? (
                <>
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={handleTableChangeClick}
                    title="Chuyển món sang bàn khác"
                  >
                    <i className="bi bi-arrow-right me-1"></i>
                    Chuyển bàn
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={onPayment}
                  >
                    <i className="bi bi-credit-card me-1"></i>
                    Thanh toán
                  </button>
                </>
              ) : (
                // Show close table button when no items
                onCloseTable && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={onCloseTable}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Đóng bàn
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa món ăn"
        message={`Bạn có chắc chắn muốn xóa "${itemToDelete?.menu_item?.name || 'món ăn này'}" không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDeleteItem}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
      />

      {/* Table Change Modal */}
      {showTableChangeModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-arrow-right me-2"></i>
                  Chuyển bàn
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowTableChangeModal(false);
                    setSelectedTargetTable(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    Chuyển tất cả món từ <strong>{table?.name}</strong> sang bàn khác
                  </small>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Chọn bàn đích:</label>
                  <select 
                    className="form-select"
                    value={selectedTargetTable || ''}
                    onChange={(e) => setSelectedTargetTable(Number(e.target.value))}
                  >
                    <option value="">-- Chọn bàn --</option>
                    {availableTables.map(availableTable => (
                      <option key={availableTable.id} value={availableTable.id}>
                        {availableTable.name} (Tầng {availableTable.floor})
                      </option>
                    ))}
                  </select>
                </div>
                
                {availableTables.length === 0 && (
                  <div className="alert alert-warning">
                    <small>Không có bàn trống để chuyển</small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTableChangeModal(false);
                    setSelectedTargetTable(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTableChange}
                  disabled={!selectedTargetTable}
                >
                  <i className="bi bi-check me-1"></i>
                  Xác nhận chuyển
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

export default TableOrderModal;


// Thêm hiệu ứng nma lười quá 
// const [tableChangeLoading, setTableChangeLoading] = useState(false);

// const handleTableChange = async () => {
//   if (!table || !selectedTargetTable) return;

//   try {
//     setTableChangeLoading(true);
//     const response = await tablesApi.changeTable({
//       from_table_id: table.id,
//       to_table_id: selectedTargetTable
//     });

//     if (response.data.success) {
//       alert('Chuyển bàn thành công!');
//       setShowTableChangeModal(false);
//       setSelectedTargetTable(null);
      
//       if (onTableChanged) {
//         onTableChanged();
//       }
      
//       onClose();
//     } else {
//       alert('Không thể chuyển bàn. Vui lòng thử lại.');
//     }
//   } catch (error) {
//     console.error('Error changing table:', error);
//     alert('Có lỗi xảy ra khi chuyển bàn');
//   } finally {
//     setTableChangeLoading(false);
//   }
// };

// // Cập nhật button confirm
// <button
//   type="button"
//   className="btn btn-primary"
//   onClick={handleTableChange}
//   disabled={!selectedTargetTable || tableChangeLoading}
// >
//   {tableChangeLoading ? (
//     <>
//       <span className="spinner-border spinner-border-sm me-1"></span>
//       Đang chuyển...
//     </>
//   ) : (
//     <>
//       <i className="bi bi-check me-1"></i>
//       Xác nhận chuyển
//     </>
//   )}
// </button>