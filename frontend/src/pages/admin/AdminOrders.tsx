import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import AdminOrderDetailsModal from "../../components/admin/AdminOrderDetailsModal";
import ordersService from "../../services/ordersService";
import type { Order } from "../../types/order";

const AdminOrders: React.FC = () => {
    const [activeFloor, setActiveFloor] = useState<number>(0); // 0 = all floors
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filters, setFilters] = useState({
        status: "all",
        search: "",
        sortBy: "newest",
        dateRange: "today",
    });

    // Helper function để chuyển đổi dateRange thành date
    const getDateFromRange = (range: string): string | undefined => {
        const now = new Date();
        switch (range) {
            case "today":
                return now.toISOString().split('T')[0];
            case "week":
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return weekAgo.toISOString().split('T')[0];
            case "month":
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return monthAgo.toISOString().split('T')[0];
            default:
                return undefined;
        }
    };

    // Lấy danh sách đơn hàng từ API
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const apiFilters = ordersService.transformFiltersToAPI({
                status: filters.status,
                search: filters.search,
                floorId: activeFloor > 0 ? activeFloor : undefined,
                dateFrom: getDateFromRange(filters.dateRange),
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
    }, [filters, activeFloor]);

    // Load orders khi component mount hoặc dependencies thay đổi
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Apply filters whenever orders change
    useEffect(() => {
        applyFilters();
    }, [orders]);

    const applyFilters = () => {
        let filtered = orders;

        // Filter by status
        if (filters.status !== "all") {
            filtered = filtered.filter((order: Order) => order.status === filters.status);
        }

        // Filter by search
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase().trim();
            filtered = filtered.filter(
                (order: Order) =>
                    order.orderNumber.toLowerCase().includes(searchLower) ||
                    order.tableName.toLowerCase().includes(searchLower) ||
                    order.customerName?.toLowerCase().includes(searchLower) ||
                    order.items.some((item: any) =>
                        item.menuItemName.toLowerCase().includes(searchLower)
                    )
            );
        }

        // Apply sorting
        switch (filters.sortBy) {
            case "newest":
                filtered.sort(
                    (a: Order, b: Order) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
            case "oldest":
                filtered.sort(
                    (a: Order, b: Order) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                break;
            case "amount-high":
                filtered.sort((a: Order, b: Order) => b.totalAmount - a.totalAmount);
                break;
            case "amount-low":
                filtered.sort((a: Order, b: Order) => a.totalAmount - b.totalAmount);
                break;
        }

        setFilteredOrders(filtered);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getOrderStats = () => {
        const active = filteredOrders.filter(order => order.status === "active").length;
        const completed = filteredOrders.filter(order => order.status === "completed").length;
        const cancelled = filteredOrders.filter(order => order.status === "cancelled").length;

        return { active, completed, cancelled, total: filteredOrders.length };
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

    // Calculate stats from filtered orders
    const stats = getOrderStats();

    // Loading state
    if (loading) {
        return (
            <AdminLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <AdminLayout>
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
                    <button className="btn btn-primary" onClick={fetchOrders} disabled={loading}>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Làm mới
                    </button>
                    <button className="btn btn-success">
                        <i className="bi bi-plus me-1"></i>
                        Tạo đơn mới
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 rounded p-3 me-3">
                                    <i className="bi bi-play-circle text-success fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1 small">Đang hoạt động</p>
                                    <h4 className="mb-0 text-success">{stats.active}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                                    <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1 small">Hoàn thành</p>
                                    <h4 className="mb-0 text-primary">{stats.completed}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-danger bg-opacity-10 rounded p-3 me-3">
                                    <i className="bi bi-x-circle text-danger fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1 small">Đã hủy</p>
                                    <h4 className="mb-0 text-danger">{stats.cancelled}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-info bg-opacity-10 rounded p-3 me-3">
                                    <i className="bi bi-receipt text-info fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted mb-1 small">Tổng đơn</p>
                                    <h4 className="mb-0 text-info">{stats.total}</h4>
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
                            <label className="form-label">Trạng thái</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={e => handleFilterChange("status", e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>

                        <div className="col-md-3 mb-3">
                            <label className="form-label">Thời gian</label>
                            <select
                                className="form-select"
                                value={filters.dateRange}
                                onChange={e => handleFilterChange("dateRange", e.target.value)}
                            >
                                <option value="today">Hôm nay</option>
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="all">Tất cả</option>
                            </select>
                        </div>

                        <div className="col-md-3 mb-3">
                            <label className="form-label">Sắp xếp theo</label>
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
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <label className="form-label">Tìm kiếm</label>
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
                                        <th>Đơn hàng</th>
                                        <th>Bàn</th>
                                        <th>Khách hàng</th>
                                        <th>Trạng thái</th>
                                        <th className="text-end">Tổng tiền</th>
                                        <th>Thời gian</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => {
                                        const statusInfo = getOrderStatusBadge(order.status);
                                        return (
                                            <tr key={order.id}>
                                                <td>
                                                    <div className="fw-bold">{order.orderNumber}</div>
                                                    <small className="text-muted">
                                                        {order.items.length} món
                                                    </small>
                                                </td>
                                                <td>
                                                    <div>{order.tableName}</div>
                                                    <small className="text-muted">{order.floorName}</small>
                                                </td>
                                                <td>{order.customerName || "Khách vãng lai"}</td>
                                                <td>
                                                    <span className={`badge bg-${statusInfo.color}`}>
                                                        <i className={`${statusInfo.icon} me-1`}></i>
                                                        {statusInfo.text}
                                                    </span>
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {order.totalAmount.toLocaleString("vi-VN")}đ
                                                </td>
                                                <td>
                                                    <div>
                                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1 justify-content-center">
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
                                                        {order.status === "active" && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                title="Hủy đơn"
                                                            >
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        )}
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
                />
            )}
        </AdminLayout>
    );
};

export default AdminOrders;