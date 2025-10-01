import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import OrderCard from "../../components/staff/OrderCard";
import OrderDetailsModal from "../../components/staff/OrderDetailsModal";
import OrderFilters from "../../components/staff/OrderFilters";
import ordersService from "../../services/ordersService";
import type { Order, OrderItem } from "../../types/order";

const StaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    floor: 0,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters = ordersService.transformFiltersToAPI({
        status: filters.status,
        search: filters.search,
        floorId: filters.floor > 0 ? filters.floor : undefined,
      });

      const response = await ordersService.getOrders(apiFilters);

      if (response.success) {
        const transformedOrders = response.data.map(order =>
          ordersService.transformOrderFromAPI(order)
        );

        setOrders(transformedOrders);
      } else {
        throw new Error('Không thể tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleItemStatusChange = async (
    orderId: number,
    itemId: number,
    status: OrderItem["status"]
  ) => {
    try {
      // Map frontend status to backend status
      let apiStatus: 'ordered' | 'cooking' | 'done' | 'served' | 'cancelled';
      
      switch (status) {
        case 'pending':
          apiStatus = 'ordered';
          break;
        case 'preparing':
          apiStatus = 'cooking';
          break;
        case 'ready':
          apiStatus = 'done';
          break;
        case 'served':
          apiStatus = 'served';
          break;
        default:
          apiStatus = 'cancelled';
      }

      await ordersService.updateOrderItemStatus(itemId, apiStatus);
      await fetchOrders();
    } catch (err: any) {
      console.error('Error updating item status:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái món ăn';
      alert(errorMessage);
    }
  }; const handleOrderStatusChange = async (
    orderId: number,
    status: Order["status"]
  ) => {
    try {
      if (status === "completed") {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await ordersService.createPayment(orderId, {
            amount: order.totalAmount,
            method: 'cash'
          });
        }
      }
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  const handleItemDelete = async (orderId: number, itemId: number) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const itemToDelete = order.items.find(item => item.id === itemId);
      if (!itemToDelete) return;

      if (itemToDelete.status !== 'pending') {
        alert('Chỉ có thể xóa món đang chờ xử lý');
        return;
      }

      const remainingItems = order.items
        .filter(item => item.id !== itemId)
        .map(item => ({
          menu_item: item.menuItemId,
          quantity: item.quantity,
          note: item.specialInstructions
        }));

      await ordersService.updateOrderItems(orderId, remainingItems);
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Có lỗi xảy ra khi xóa món ăn');
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredOrders = orders.filter(order => {
    if (filters.status !== "all" && order.status !== filters.status) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.tableName.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.items.some(item =>
          item.menuItemName.toLowerCase().includes(searchLower)
        )
      );
    }

    return true;
  });

  if (loading) {
    return (
      <StaffLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout>
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            className="btn btn-outline-danger ms-3"
            onClick={fetchOrders}
          >
            Thử lại
          </button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-cart me-2"></i>
            Quản lý đơn hàng
          </h2>
          <p className="text-muted mb-0">
            Theo dõi và xử lý đơn hàng của khách hàng
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={fetchOrders}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Làm mới
        </button>
      </div>

      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="row">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="col-12 col-lg-6 mb-3">
              <OrderCard
                order={order}
                onItemStatusChange={handleItemStatusChange}
                onOrderStatusChange={handleOrderStatusChange}
                onItemDelete={handleItemDelete}
                onViewDetails={handleViewOrder}
              />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Không có đơn hàng nào</h5>
              <p className="text-muted">
                {filters.status !== "all" || filters.search
                  ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại."
                  : "Chưa có đơn hàng nào được tạo."
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          show={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onItemStatusChange={handleItemStatusChange}
          onOrderStatusChange={handleOrderStatusChange}
          onItemDelete={handleItemDelete}
        />
      )}
    </StaffLayout>
  );
};

export default StaffOrders;