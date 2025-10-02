import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import OrderCard from "../../components/staff/OrderCard";
import { ordersApiService, transformOrderData } from "../../services/ordersApi";
import type { Order, OrderItem } from "../../types/order";

const StaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(0); // 0 means "All floors"
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ordersApiService.getAllOrders({
        status: 'unpaid',
        page_size: 100
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        const transformedOrders = response.data.data.map(transformOrderData);
        setOrders(transformedOrders);
      } else {
        setOrders([]);
        console.warn('No orders data received from API');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleItemStatusChange = async (
    orderId: number,
    itemId: number,
    status: OrderItem["status"]
  ) => {
    try {
      let backendStatus: 'ordered' | 'cooking' | 'done' | 'cancelled';

      switch (status) {
        case 'pending':
          backendStatus = 'ordered';
          break;
        case 'preparing':
          backendStatus = 'cooking';
          break;
        case 'ready':
          backendStatus = 'done';
          break;
        case 'served':
          backendStatus = 'done';
          break;
        default:
          backendStatus = 'cancelled';
      }

      const response = await ordersApiService.updateOrderItemStatus(itemId, backendStatus);

      if (response.data.success) {
        await fetchOrders();
      } else {
        throw new Error('Không thể cập nhật trạng thái');
      }
    } catch (err: any) {
      console.error('Error updating item status:', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái món ăn');
    }
  };

  const handleOrderStatusChange = async (
    orderId: number,
    status: Order["status"]
  ) => {
    try {
      const backendStatus = status === 'completed' ? 'paid' : 'unpaid';

      const response = await ordersApiService.updateOrderStatus(orderId, backendStatus);

      if (response.data.success) {
        await fetchOrders();
      } else {
        throw new Error('Không thể cập nhật trạng thái đơn hàng');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  const handleItemDelete = async (orderId: number, itemId: number) => {
    try {
      const response = await ordersApiService.cancelOrderItem(itemId);

      if (response.data.success) {
        await fetchOrders();
      } else {
        throw new Error('Không thể hủy món ăn');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Có lỗi xảy ra khi hủy món ăn');
    }
  };

  // Get unique floors from orders
  const availableFloors = React.useMemo(() => {
    const floors = new Set<number>();
    orders.forEach(order => {
      if (order.floorId) {
        floors.add(order.floorId);
      }
    });
    return Array.from(floors).sort((a, b) => a - b);
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    // Filter by selected floor
    if (selectedFloor !== 0 && order.floorId !== selectedFloor) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.tableName.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        (order.items || []).some(item =>
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
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="text-muted">Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  if (error) {
    return (
      <StaffLayout>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchOrders}>
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

      {/* Search Bar */}
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo số đơn, bàn, khách hàng, món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSearchQuery("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Floor Tabs */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <i className="bi bi-building me-2 text-primary"></i>
          <strong>Chọn tầng:</strong>
        </div>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${selectedFloor === 0 ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSelectedFloor(0)}
          >
            <i className="bi bi-grid-3x3 me-1"></i>
            Tất cả tầng
            <span className="badge bg-light text-dark ms-2">{orders.length}</span>
          </button>
          {availableFloors.map(floor => {
            const floorOrderCount = orders.filter(o => o.floorId === floor).length;
            return (
              <button
                key={floor}
                type="button"
                className={`btn ${selectedFloor === floor ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedFloor(floor)}
              >
                <i className="bi bi-layers me-1"></i>
                Tầng {floor}
                <span className="badge bg-light text-dark ms-2">{floorOrderCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="row">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="col-12 mb-3">
              <OrderCard
                order={order}
                onItemStatusChange={handleItemStatusChange}
                onOrderStatusChange={handleOrderStatusChange}
                onItemDelete={handleItemDelete}
              />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Không có đơn hàng nào</h5>
              <p className="text-muted">
                {searchQuery || selectedFloor !== 0
                  ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại."
                  : "Chưa có đơn hàng nào được tạo."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffOrders;