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
    path('change/', views.table_change_view, name='table-change'),
    
    # Table order endpoint
    path('<int:pk>/order/', views.TableOrderView.as_view(), name='table-order'),
    
    # Statistics endpoint
    path('stats/', views.table_stats_view, name='table-stats'),
]

# ======================================================================
# TABLE MANAGEMENT APIs - PHÂN QUYỀN RÕ RÀNG + CHUYỂN BÀN
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

# 🔄 CHUYỂN BÀN (Staff + Admin):
# POST   /api/tables/change/    - Chuyển bàn cho order (từ unavailable → available)

# ======================================================================
# QUERY PARAMETERS:
# ======================================================================
# GET /api/tables/:
# ?floor=1           - Lọc theo tầng
# ?status=available  - Lọc theo trạng thái (available/unavailable)
# ?search=Bàn 1      - Tìm kiếm theo tên bàn

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

# POST /api/tables/change/ (Chuyển bàn - từ unavailable sang available):
# {
#   "from_table_id": 5,     // Bàn nguồn (phải unavailable, có order unpaid)
#   "to_table_id": 2        // Bàn đích (phải available)
# }
# Business Rules:
# • Bàn nguồn phải có status 'unavailable' (có order unpaid)
# • Bàn đích phải có status 'available' (trống)
# • Sau khi chuyển: bàn nguồn → 'available', bàn đích → 'unavailable'
# • Tất cả orders unpaid sẽ được chuyển sang bàn đích