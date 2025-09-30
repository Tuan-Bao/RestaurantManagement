import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import OrderCard from "../../components/staff/OrderCard";
import OrderFloorTabs from "../../components/staff/OrderFloorTabs";
import OrderFilters from "../../components/staff/OrderFilters";
import type { Floor, Order, OrderItem } from "../../types/order";

const StaffOrders: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState<number>(0); // 0 = all floors
  const [floors, setFloors] = useState<Floor[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockFloors: Floor[] = [
      {
        id: 1,
        name: "Tầng 1",
        orders: [
          {
            id: 1,
            orderNumber: "ORD-001",
            tableId: 1,
            tableName: "Bàn 1",
            floorId: 1,
            floorName: "Tầng 1",
            customerName: "Nguyễn Văn A",
            status: "active",
            totalAmount: 450000,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            notes: "Khách yêu cầu ít cay",
            estimatedCompletionTime: new Date(
              Date.now() + 15 * 60 * 1000
            ).toISOString(),
            items: [
              {
                id: 1,
                menuItemId: 101,
                menuItemName: "Phở bò đặc biệt",
                quantity: 2,
                unitPrice: 80000,
                totalPrice: 160000,
                status: "ready",
                estimatedTime: 5,
              },
              {
                id: 2,
                menuItemId: 102,
                menuItemName: "Bánh mì thịt nướng",
                quantity: 1,
                unitPrice: 35000,
                totalPrice: 35000,
                status: "preparing",
                specialInstructions: "Không rau thơm",
                estimatedTime: 10,
              },
              {
                id: 3,
                menuItemId: 103,
                menuItemName: "Cà phê sữa đá",
                quantity: 3,
                unitPrice: 25000,
                totalPrice: 75000,
                status: "served",
              },
              {
                id: 4,
                menuItemId: 104,
                menuItemName: "Chả cá Lă Vọng",
                quantity: 1,
                unitPrice: 180000,
                totalPrice: 180000,
                status: "pending",
                estimatedTime: 20,
              },
            ],
          },
          {
            id: 2,
            orderNumber: "ORD-002",
            tableId: 3,
            tableName: "Bàn 3",
            floorId: 1,
            floorName: "Tầng 1",
            customerName: "Trần Thị B",
            status: "active",
            totalAmount: 280000,
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            items: [
              {
                id: 5,
                menuItemId: 105,
                menuItemName: "Bún bò Huế",
                quantity: 2,
                unitPrice: 70000,
                totalPrice: 140000,
                status: "served",
              },
              {
                id: 6,
                menuItemId: 106,
                menuItemName: "Nước mía",
                quantity: 2,
                unitPrice: 20000,
                totalPrice: 40000,
                status: "served",
              },
              {
                id: 7,
                menuItemId: 107,
                menuItemName: "Tôm rang me",
                quantity: 1,
                unitPrice: 100000,
                totalPrice: 100000,
                status: "ready",
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "Tầng 2",
        orders: [
          {
            id: 3,
            orderNumber: "ORD-003",
            tableId: 9,
            tableName: "Bàn 9",
            floorId: 2,
            floorName: "Tầng 2",
            customerName: "Lê Văn C",
            status: "active",
            totalAmount: 650000,
            createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            notes: "Bàn sinh nhật, cần trang trí",
            items: [
              {
                id: 8,
                menuItemId: 108,
                menuItemName: "Lẩu thái hải sản",
                quantity: 1,
                unitPrice: 350000,
                totalPrice: 350000,
                status: "preparing",
                estimatedTime: 25,
              },
              {
                id: 9,
                menuItemId: 109,
                menuItemName: "Rau củ luộc",
                quantity: 2,
                unitPrice: 50000,
                totalPrice: 100000,
                status: "ready",
              },
              {
                id: 10,
                menuItemId: 110,
                menuItemName: "Bia Sài Gòn",
                quantity: 4,
                unitPrice: 25000,
                totalPrice: 100000,
                status: "served",
              },
              {
                id: 11,
                menuItemId: 111,
                menuItemName: "Bánh flan",
                quantity: 4,
                unitPrice: 25000,
                totalPrice: 100000,
                status: "pending",
              },
            ],
          },
        ],
      },
      {
        id: 3,
        name: "Sân thượng",
        orders: [
          {
            id: 4,
            orderNumber: "ORD-004",
            tableId: 15,
            tableName: "Bàn VIP 1",
            floorId: 3,
            floorName: "Sân thượng",
            status: "completed",
            totalAmount: 1200000,
            createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            items: [
              {
                id: 12,
                menuItemId: 112,
                menuItemName: "Set nướng cao cấp",
                quantity: 1,
                unitPrice: 800000,
                totalPrice: 800000,
                status: "served",
              },
              {
                id: 13,
                menuItemId: 113,
                menuItemName: "Rượu vang đỏ",
                quantity: 1,
                unitPrice: 400000,
                totalPrice: 400000,
                status: "served",
              },
            ],
          },
        ],
      },
    ];
    setFloors(mockFloors);
  }, []);

  const getCurrentOrders = useCallback(() => {
    if (activeFloor === 0) {
      return floors.flatMap(floor => floor.orders);
    }
    return floors.find(floor => floor.id === activeFloor)?.orders || [];
  }, [floors, activeFloor]);

  const handleItemStatusChange = (
    orderId: number,
    itemId: number,
    newStatus: OrderItem["status"]
  ) => {
    setFloors(prevFloors =>
      prevFloors.map(floor => ({
        ...floor,
        orders: floor.orders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              items: order.items.map(item =>
                item.id === itemId ? { ...item, status: newStatus } : item
              ),
              updatedAt: new Date().toISOString(),
            };
          }
          return order;
        }),
      }))
    );

    // Show success message
    const statusMessages = {
      pending: "Đã đặt lại trạng thái chờ xử lý",
      preparing: "Đã bắt đầu chuẩn bị món ăn",
      ready: "Món ăn đã sẵn sàng phục vụ",
      served: "Đã đánh dấu món ăn đã phục vụ",
    };
    // You can replace this with a toast notification
    console.log(statusMessages[newStatus]);
  };

  const handleOrderStatusChange = (
    orderId: number,
    newStatus: Order["status"]
  ) => {
    setFloors(prevFloors =>
      prevFloors.map(floor => ({
        ...floor,
        orders: floor.orders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return order;
        }),
      }))
    );

    // Show success message
    const statusMessages = {
      active: "Đơn hàng đã được kích hoạt lại",
      completed: "Đơn hàng đã hoàn thành thành công",
      cancelled: "Đơn hàng đã được hủy",
    };
    alert(statusMessages[newStatus]);
  };

  const currentOrders = getCurrentOrders();

  return (
    <StaffLayout>
      <div className="mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-cart me-2"></i>
            Quản lý đơn hàng
          </h2>
          <p className="text-muted mb-0">
            Theo dõi và cập nhật trạng thái các đơn hàng trong nhà hàng
          </p>
        </div>
      </div>

      {/* Filters and Statistics */}
      <OrderFilters
        orders={currentOrders}
        onFilteredOrdersChange={setFilteredOrders}
      />

      {/* Floor Navigation */}
      <OrderFloorTabs
        floors={floors}
        activeFloor={activeFloor}
        onFloorChange={setActiveFloor}
      />

      {/* Orders List */}
      <div className="row">
        <div className="col-12">
          {filteredOrders.length > 0 ? (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <i className="bi bi-list me-2"></i>
                  Danh sách đơn hàng ({filteredOrders.length})
                </h5>
                <small className="text-muted">
                  {activeFloor === 0
                    ? "Tất cả các tầng"
                    : floors.find(f => f.id === activeFloor)?.name}
                </small>
              </div>

              {filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onItemStatusChange={handleItemStatusChange}
                  onOrderStatusChange={handleOrderStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Không có đơn hàng nào</h5>
              <p className="text-muted">
                {activeFloor === 0
                  ? "Chưa có đơn hàng nào trong hệ thống."
                  : `Không có đơn hàng nào trong ${
                      floors.find(f => f.id === activeFloor)?.name
                    }.`}
              </p>
              <button className="btn btn-primary">
                <i className="bi bi-plus me-2"></i>
                Tạo đơn hàng mới
              </button>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffOrders;
