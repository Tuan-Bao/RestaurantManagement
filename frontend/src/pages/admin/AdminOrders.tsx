import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import AdminOrderDetailsModal from "../../components/admin/AdminOrderDetailsModal";
import { ordersApiService, transformOrderData } from "../../services/ordersApi";
import type { Order } from "../../types/order";

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filters, setFilters] = useState({
        search: "",
        sortBy: "newest",
        dateRange: "all", // all, today, week, month, year
    });

    // Load orders from API
    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Calculate date range for API filter
            let dateFrom: string | undefined;
            const today = new Date();

            switch (filters.dateRange) {
                case 'today':
                    dateFrom = today.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    dateFrom = weekAgo.toISOString().split('T')[0];
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    dateFrom = monthAgo.toISOString().split('T')[0];
                    break;
                case 'year':
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(today.getFullYear() - 1);
                    dateFrom = yearAgo.toISOString().split('T')[0];
                    break;
                default:
                    dateFrom = undefined;
            }

            const response = await ordersApiService.getAllOrders({
                search: filters.search || undefined,
                date_from: dateFrom,
                page_size: 1000
            });

            if (response.data.success && Array.isArray(response.data.data)) {
                const transformedOrders = response.data.data
                    .map(transformOrderData)
                    .filter((order: Order) => order.status !== 'cancelled'); // Exclude cancelled orders
                setOrders(transformedOrders);
            } else {
                setOrders([]);
                console.warn('No orders data received from API');
            }
        } catch (err) {
            console.error('Error loading orders:', err);
            setError('Không thể tải dữ liệu đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Apply client-side filtering and sorting
    useEffect(() => {
        let filtered = [...orders];

        // Filter by search
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase().trim();
            filtered = filtered.filter(
                order =>
                    order.orderNumber.toLowerCase().includes(searchLower) ||
                    order.tableName.toLowerCase().includes(searchLower) ||
                    order.customerName?.toLowerCase().includes(searchLower) ||
                    (order.items || []).some(item =>
                        item.menuItemName.toLowerCase().includes(searchLower)
                    )
            );
        }

        // Sort orders
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "amount-high":
                    return b.totalAmount - a.totalAmount;
                case "amount-low":
                    return a.totalAmount - b.totalAmount;
                default:
                    return 0;
            }
        });

        setFilteredOrders(filtered);
    }, [orders, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getOrderStats = () => {
        const active = filteredOrders.filter(order => order.status === "active").length;
        const completed = filteredOrders.filter(order => order.status === "completed").length;
        const totalRevenue = filteredOrders
            .filter(order => order.status === "completed")
            .reduce((sum, order) => sum + order.totalAmount, 0);

        return { active, completed, totalRevenue, total: filteredOrders.length };
    };

    const getOrderStatusBadge = (status: Order["status"]) => {
        const statusConfig = {
            active: {
                color: "success",
                text: "Đang hoạt động",
                icon: "bi-play-circle",
            },
            completed: {
                color: "primary",
                text: "Hoàn thành",
                icon: "bi-check-circle-fill",
            },
            cancelled: { color: "danger", text: "Đã hủy", icon: "bi-x-circle" },
        };
        return statusConfig[status];
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const handleCloseModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
    };

    // Add order status update function
    const handleOrderStatusChange = async (orderId: number, newStatus: Order["status"]) => {
        try {
            // Only allow changing from active to completed
            const backendStatus = newStatus === 'completed' ? 'paid' : 'unpaid';

            const response = await ordersApiService.updateOrderStatus(orderId, backendStatus);

            if (response.data.success) {
                await loadOrders();
            } else {
                throw new Error('Không thể cập nhật trạng thái đơn hàng');
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        }
    };

    // Add item status update function
    const handleItemStatusChange = async (itemId: number, status: 'ordered' | 'cooking' | 'done'|'cancelled') => {
        try {
            const response = await ordersApiService.updateOrderItemStatus(itemId, status);

            if (response.data.success) {
                await loadOrders();
                // Also refresh the selected order in the modal
                if (selectedOrder) {
                    const updatedOrderResponse = await ordersApiService.getOrderById(selectedOrder.id);
                    if (updatedOrderResponse.data.success) {
                        setSelectedOrder(transformOrderData(updatedOrderResponse.data.data));
                    }
                }
            } else {
                throw new Error('Không thể cập nhật trạng thái món ăn');
            }
        } catch (err) {
            console.error('Error updating item status:', err);
            alert('Có lỗi xảy ra khi cập nhật trạng thái món ăn');
        }
    };

    const stats = getOrderStats();

    if (loading) {
        return (
            <AdminLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="text-muted">Đang tải danh sách đơn hàng...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Lỗi!</h4>
                    <p>{error}</p>
                    <button className="btn btn-outline-danger" onClick={loadOrders}>
                        Thử lại
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="bi bi-clipboard-data me-2"></i>
                        Quản lý đơn hàng
                    </h2>
                    <p className="text-muted mb-0">
                        Theo dõi và phân tích tất cả đơn hàng trong hệ thống
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary" onClick={loadOrders}>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 rounded-3 p-3 me-3">
                                    <i className="bi bi-play-circle text-success fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1">Đang hoạt động</p>
                                    <h3 className="mb-0">{stats.active}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                                    <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1">Hoàn thành</p>
                                    <h3 className="mb-0">{stats.completed}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-warning bg-opacity-10 rounded-3 p-3 me-3">
                                    <i className="bi bi-currency-dollar text-warning fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1">Doanh thu</p>
                                    <h5 className="mb-0">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-info bg-opacity-10 rounded-3 p-3 me-3">
                                    <i className="bi bi-receipt text-info fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1">Tổng đơn</p>
                                    <h3 className="mb-0">{stats.total}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <label className="form-label">
                                <i className="bi bi-calendar-range me-1"></i>
                                Khoảng thời gian
                            </label>
                            <select
                                className="form-select"
                                value={filters.dateRange}
                                onChange={e => handleFilterChange("dateRange", e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">Tuần này</option>
                                <option value="month">Tháng này</option>
                                <option value="year">Năm này</option>
                            </select>
                        </div>

                        <div className="col-md-3 mb-3">
                            <label className="form-label">
                                <i className="bi bi-sort-down me-1"></i>
                                Sắp xếp theo
                            </label>
                            <select
                                className="form-select"
                                value={filters.sortBy}
                                onChange={e => handleFilterChange("sortBy", e.target.value)}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="amount-high">Giá trị cao</option>
                                <option value="amount-low">Giá trị thấp</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                <i className="bi bi-search me-1"></i>
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm theo số đơn, bàn, khách hàng, món ăn..."
                                value={filters.search}
                                onChange={e => handleFilterChange("search", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                            <i className="bi bi-list me-2"></i>
                            Danh sách đơn hàng ({filteredOrders.length})
                        </h6>
                    </div>
                </div>
                <div className="card-body p-0">
                    {filteredOrders.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Số đơn</th>
                                        <th>Bàn</th>
                                        <th>Khách hàng</th>
                                        <th>Thời gian</th>
                                        <th className="text-end">Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => {
                                        const statusInfo = getOrderStatusBadge(order.status);
                                        return (
                                            <tr key={order.id}>
                                                <td>
                                                    <span className="fw-bold">{order.orderNumber}</span>
                                                </td>
                                                <td>
                                                    <span className="text-muted">{order.tableName}</span>
                                                    <br />
                                                    <small className="text-muted">{order.floorName}</small>
                                                </td>
                                                <td>
                                                    <span>{order.customerName || "Khách vãng lai"}</span>
                                                </td>
                                                <td>
                                                    <span>{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                                                </td>
                                                <td className="text-end">
                                                    <span className="fw-bold text-primary">
                                                        {order.totalAmount.toLocaleString("vi-VN")}đ
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${statusInfo.color}`}>
                                                        <i className={`${statusInfo.icon} me-1`}></i>
                                                        {statusInfo.text}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Xem chi tiết"
                                                            onClick={() => handleViewOrder(order)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            title="In hóa đơn"
                                                        >
                                                            <i className="bi bi-printer"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
                            <h5 className="text-muted">Không có đơn hàng nào</h5>
                            <p className="text-muted">
                                Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <AdminOrderDetailsModal
                    order={selectedOrder}
                    show={showOrderModal}
                    onClose={handleCloseModal}
                    onItemStatusChange={handleItemStatusChange}
                />
            )}
        </AdminLayout>
    );
};

export default AdminOrders;