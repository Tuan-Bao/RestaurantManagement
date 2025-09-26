from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # Order endpoints
    path('', views.OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('table/<int:table_id>/', views.order_by_table_view, name='order-by-table'),
    
    # Order Items endpoints
    path('<int:order_id>/items/', views.OrderItemBulkUpdateView.as_view(), name='order-item-bulk-update'),
    path('items/<int:pk>/status/', views.OrderItemStatusUpdateView.as_view(), name='order-item-status-update'),
    path('items/<int:pk>/', views.OrderItemDeleteView.as_view(), name='order-item-delete'),
    
    # Payment endpoints
    path('<int:order_id>/payments/', views.PaymentListCreateView.as_view(), name='payment-list-create'),
    
    # Statistics endpoint
    path('stats/', views.order_stats_view, name='order-stats'),
]

# ======================================================================
# ORDERS MANAGEMENT APIs - PHÂN QUYỀN: STAFF + ADMIN
# ======================================================================

# 📋 ORDER APIs:
# GET    /api/orders/?table=...&status=...     - Danh sách đơn hàng
# POST   /api/orders/                          - Tạo đơn hàng mới + thêm món
# GET    /api/orders/{id}/                     - Chi tiết đơn hàng
# GET    /api/orders/table/{table_id}/         - Xem đơn hàng theo bàn

# 🍽️ ORDER ITEMS APIs:
# PATCH  /api/orders/{order_id}/items/         - Quản lý món (thêm/sửa/xóa)
# PATCH  /api/orders/items/{id}/status/        - Cập nhật trạng thái món
# DELETE /api/orders/items/{id}/               - Xóa món (chỉ status = ordered)

# 💳 PAYMENT APIs:
# GET    /api/orders/{order_id}/payments/      - Danh sách thanh toán
# POST   /api/orders/{order_id}/payments/      - Thanh toán + đóng đơn tự động

# 📊 STATISTICS APIs:
# GET    /api/orders/stats/                    - Thống kê đơn hàng

# ======================================================================
# BODY EXAMPLES:
# ======================================================================

# POST /api/orders/ - Tạo đơn + thêm món:
# {
#   "table": 1,
#   "items": [
#     {"menu_item": 1, "quantity": 2, "note": "Ít cay"},
#     {"menu_item": 2, "quantity": 1}
#   ]
# }

# PATCH /api/orders/{order_id}/items/ - Quản lý món (thêm/sửa/xóa):
# [
#   {"menu_item": 1, "quantity": 3, "note": "Ít cay"},      // Có sẵn -> update
#   {"menu_item": 3, "quantity": 1, "note": "Không hành"}, // Mới -> thêm
#   {"menu_item": 4, "quantity": 2}                        // Mới -> thêm
# ]
# Món không có trong mảng sẽ bị xóa (nếu status = ordered)

# PATCH /api/orders/items/{id}/status/ - Cập nhật trạng thái món:
# {
#   "status": "cooking"    // ordered -> cooking -> done -> cancelled
# }

# POST /api/orders/{order_id}/payments/ - Thanh toán:
# {
#   "amount": 150000,
#   "discount": 15000,
#   "tax": 0,
#   "method": "cash"
# }