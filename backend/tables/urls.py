from django.urls import path
from . import views

app_name = 'tables'

urlpatterns = [
    # Table CRUD endpoints
    path('', views.TableListCreateView.as_view(), name='table-list-create'),
    path('<int:pk>/', views.TableDetailView.as_view(), name='table-detail'),
    
    # Status change endpoint
    path('<int:pk>/status/', views.table_status_view, name='table-status'),
    
    # Table operations
    path('merges/', views.TableMergeListView.as_view(), name='table-merge-list'),
    path('merge/', views.table_merge_view, name='table-merge'),
    path('change/', views.table_change_view, name='table-change'),
    
    # Table order endpoint
    path('<int:pk>/order/', views.TableOrderView.as_view(), name='table-order'),
    
    # Statistics endpoint
    path('stats/', views.table_stats_view, name='table-stats'),
]

# ======================================================================
# TABLE MANAGEMENT APIs - PHÂN QUYỀN RÕ RÀNG + GHÉP BÀN/ĐỔI BÀN
# ======================================================================

# 👥 STAFF + ADMIN (Đã đăng nhập):
# GET    /api/tables/           - Xem danh sách bàn
# GET    /api/tables/{id}/      - Xem chi tiết bàn  
# PATCH  /api/tables/{id}/status/ - Thay đổi trạng thái bàn (available ↔ unavailable)
# GET    /api/tables/{id}/order/ - Lấy order unpaid của bàn (chỉ unavailable tables)
# GET    /api/tables/stats/     - Xem thống kê bàn

# 🔒 ADMIN ONLY:
# POST   /api/tables/           - Tạo bàn mới
# PATCH  /api/tables/{id}/      - Cập nhật thông tin bàn (name, floor)
# DELETE /api/tables/{id}/      - Xóa bàn (soft delete)

# 🍽️ GHÉP BÀN & ĐỔI BÀN (Staff + Admin):
# GET    /api/tables/merges/    - Xem danh sách ghép bàn  
# POST   /api/tables/merge/     - Ghép bàn (chỉ available tables)
# POST   /api/tables/change/    - Đổi bàn cho order (chỉ sang available tables)
# 
# 🔄 TỰ ĐỘNG TÁCH BÀN:
# - Bàn sẽ tự động tách về trạng thái ban đầu khi tất cả orders được thanh toán (paid)

# ======================================================================
# QUERY PARAMETERS:
# ======================================================================
# GET /api/tables/:
# ?floor=1           - Lọc theo tầng
# ?status=available  - Lọc theo trạng thái (available/unavailable/merged)
# ?search=Bàn 1      - Tìm kiếm theo tên bàn

# GET /api/tables/merges/:
# ?is_active=true    - Lọc ghép bàn đang hoạt động
# ?main_table=5      - Lọc theo bàn chính

# ======================================================================
# BODY EXAMPLES:
# ======================================================================

# GET /api/tables/{id}/order/ Response (Bàn có order unpaid):
# {
#   "success": true,
#   "data": {
#     "id": 15,
#     "status": "unpaid",
#     "total_amount": "450000.00",
#     "created_at": "2024-01-15T14:30:00Z",
#     "user": {"id": 1, "username": "staff01"},
#     "table": {"id": 5, "name": "Bàn 5", "floor": 2},
#     "order_items": [
#       {"id": 20, "quantity": 2, "status": "ordered", "menu_item": {"name": "Phở bò", "price": "80000.00"}},
#       {"id": 21, "quantity": 1, "status": "cooking", "menu_item": {"name": "Cơm gà", "price": "90000.00"}}
#     ]
#   },
#   "table_info": {
#     "table_id": 5,
#     "table_name": "Bàn 5", 
#     "floor": 2,
#     "status": "unavailable"
#   }
# }

# POST /api/tables/merge/ (Ghép bàn - chỉ available tables):
# {
#   "main_table_id": 1,
#   "merged_table_ids": [2, 3, 4]
# }

# POST /api/tables/change/ (Đổi bàn - chỉ sang available tables):
# {
#   "from_table_id": 1,
#   "to_table_id": 5,
#   "order_id": 10  // Optional: nếu không có thì move tất cả orders
# }

# ======================================================================
# GHÉP BÀN & TỰ ĐỘNG TÁCH:
# ======================================================================
# 1. Chỉ ghép được các bàn có status = 'available'
# 2. Sau khi ghép, các bàn phụ sẽ có status = 'merged'
# 3. Khi tất cả orders trong merge được thanh toán → tự động tách bàn về 'available'
# 4. Không cần thao tác manual để tách bàn