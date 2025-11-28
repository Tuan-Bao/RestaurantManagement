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
    path('<int:order_id>/payments/', views.PaymentCreateView.as_view(), name='payment-create'),
    
    # MoMo Payment endpoints
    path('<int:order_id>/payments/momo/', views.create_momo_payment, name='momo-payment-create'),
    path('<int:order_id>/payments/momo/status/', views.check_momo_payment_status, name='momo-payment-status'),
    
    # Statistics endpoint
    path('stats/', views.order_stats_view, name='order-stats'),
]

# ======================================================================
# ORDERS MANAGEMENT APIs - PHÂN QUYỀN: STAFF + ADMIN
# ======================================================================

# 📋 ORDER APIs:
# GET    /api/orders/?table=...&status=...&floor=...&date_from=...&date_to=...&table_name=...     
#        - Lịch sử đơn hàng với ordering: tầng (tăng dần) → tên bàn (tăng dần) → order_id (giảm dần)
#        - Filter: table, status, floor, date_from, date_to, table_name
#        - Response: OrderHistorySerializer (bao gồm thông tin bàn, tầng, user, total_amount, payment_info)
# POST   /api/orders/                          - Tạo đơn hàng mới + thêm món
# GET    /api/orders/{id}/                     - Chi tiết đơn hàng với order_items gộp theo món+status
#        - Order items được gộp: cùng món + cùng status → sum quantity

# 🍽️ ORDER ITEMS APIs:
# PATCH  /api/orders/items/{id}/status/       - Cập nhật trạng thái món
#        Điều kiện chuyển trạng thái:
#        • ordered → cooking: Chỉ chấp nhận từ trạng thái "ordered"
#        • cooking → done: Chỉ chấp nhận từ trạng thái "cooking"  
#        • cancelled: Chấp nhận từ mọi trạng thái trừ "done"
# DELETE /api/orders/items/{id}/               - Xóa order item
#        Chỉ cho phép xóa items có status "ordered" hoặc "cancelled"

# 💰 PAYMENT APIs:
# POST   /api/orders/{order_id}/payments/     - Tạo thanh toán mới
#        final_amount = amount (bỏ qua discount và tax)

# 📊 STATISTICS APIs:
# GET    /api/orders/stats/                   - Thống kê orders
# GET    /api/orders/{id}/                     - Chi tiết đơn hàng
# GET    /api/orders/table/{table_id}/         - Xem đơn hàng theo bàn

# 🍽️ ORDER ITEMS APIs:
# PATCH  /api/orders/{order_id}/items/         - Quản lý món trong đơn hàng (thêm/sửa/xóa)
#        Logic mới:
#        • Món đã có + status ordered: cập nhật số lượng
#        • Món không có trong mảng + status ordered/cancelled: xóa
#        • Món không có trong mảng + status cooking/done: không xóa, báo lỗi
#        • Món mới: thêm với status ordered
#        • Món đã có + status cooking/done: tạo record mới với status ordered
# PATCH  /api/orders/items/{id}/status/        - Cập nhật trạng thái món

# ======================================================================
# BODY EXAMPLES:
# ======================================================================

# GET /api/orders/ Response - Lịch sử đơn hàng với payment info:
# {
#   "success": true,
#   "data": [
#     {
#       "id": 15,
#       "table": 5,
#       "table_name": "Bàn 5",
#       "table_floor": 2,
#       "user": 1,
#       "user_name": "Nhân viên A",
#       "status": "paid",
#       "total_amount": "250000.00",
#       "payment_info": {
#         "payment_id": 8,
#         "amount": "250000.00",
#         "discount": "25000.00",
#         "tax": "0.00",
#         "final_amount": "250000.00",  // Chỉ lấy amount gốc
#         "method": "cash",
#         "paid_at": "2024-01-15T15:30:00Z"
#       },
#       "table_info": {
#         "table_id": 5,
#         "table_name": "Bàn 5",
#         "floor": 2,
#         "status": "available"
#       },
#       "created_at": "2024-01-15T14:30:00Z",
#       "closed_at": "2024-01-15T15:30:00Z"
#     }
#   ],
#   "total": 1
# }

# POST /api/orders/ - Tạo đơn + thêm món:
# {
#   "table": 1,
#   "items": [
#     {"menu_item": 1, "quantity": 2, "note": "Ít cay"},
#     {"menu_item": 2, "quantity": 1}
#   ]
# }

# GET /api/orders/{id}/ Response - Chi tiết đơn với order_items gộp:
# {
#   "success": true,
#   "data": {
#     "id": 15,
#     "table": 5,
#     "user": 1,
#     "status": "unpaid",
#     "order_items": [
#       {
#         "menu_item": 1,
#         "menu_item_name": "Phở bò",
#         "menu_item_price": "80000.00",
#         "status": "done",
#         "quantity": 5,           // Gộp: 2 + 3 = 5 (cùng món + cùng status)
#         "price_each": "80000.00",
#         "subtotal": "400000.00"
#       },
#       {
#         "menu_item": 1,
#         "menu_item_name": "Phở bò", 
#         "menu_item_price": "80000.00",
#         "status": "ordered",
#         "quantity": 2,           // Record riêng vì khác status
#         "price_each": "80000.00",
#         "subtotal": "160000.00"
#       }
#     ],
#     "total_amount": "560000.00",
#     "items_count": 2           // Đếm unique combinations (món+status)
#   }
# }

# PATCH /api/orders/{order_id}/items/ - Quản lý món (logic mới):
# [
#   {"menu_item": 1, "quantity": 3, "note": "Ít cay"},      // Món đã có + ordered: update quantity
#   {"menu_item": 2, "quantity": 2},                        // Món mới: thêm với status ordered
#   {"menu_item": 3, "quantity": 1, "note": "Không hành"}   // Món đã có + cooking/done: tạo record mới
# ]
# Logic xử lý:
# • Món có trong mảng + status ordered → Cập nhật quantity/note
# • Món có trong mảng + status cooking/done → Tạo record mới với status ordered
# • Món không có trong mảng + status ordered/cancelled → Xóa
# • Món không có trong mảng + status cooking/done → Không xóa, báo lỗi

# PATCH /api/orders/items/{id}/status/ - Cập nhật trạng thái món:
# {
#   "status": "cooking"    
# }
# Điều kiện chuyển trạng thái:
# • "ordered" → "cooking": ✅ Hợp lệ
# • "cooking" → "done": ✅ Hợp lệ  
# • "ordered"/"cooking" → "cancelled": ✅ Hợp lệ
# • "done" → "cancelled": ❌ Không được phép
# • "cooking" → "ordered": ❌ Không được phép
# • "done" → "cooking": ❌ Không được phép

# POST /api/orders/{order_id}/payments/ - Thanh toán:
# {
#   "amount": 150000,      // Số tiền thanh toán thực tế
#   "discount": 15000,     // Giảm giá (chỉ để lưu trữ, không ảnh hưởng final_amount)
#   "tax": 0,              // Thuế (chỉ để lưu trữ, không ảnh hưởng final_amount)
#   "method": "cash"       // Phương thức thanh toán
# }
# Response: final_amount = amount = 150000 (bỏ qua discount và tax)