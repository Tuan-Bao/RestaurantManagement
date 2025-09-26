from django.urls import path
from . import views

app_name = 'tables'

urlpatterns = [
    # Table CRUD endpoints
    path('', views.TableListCreateView.as_view(), name='table-list-create'),
    path('<int:pk>/', views.TableDetailView.as_view(), name='table-detail'),
    
    # Status change endpoint
    path('<int:pk>/status/', views.table_status_view, name='table-status'),
    
    # Statistics endpoint
    path('stats/', views.table_stats_view, name='table-stats'),
]

# ======================================================================
# TABLE MANAGEMENT APIs - PHÂN QUYỀN RÕ RÀNG
# ======================================================================

# 👥 STAFF + ADMIN (Đã đăng nhập):
# GET    /api/tables/           - Xem danh sách bàn
# GET    /api/tables/{id}/      - Xem chi tiết bàn  
# PATCH  /api/tables/{id}/status/ - Thay đổi trạng thái bàn (available ↔ unavailable)
# GET    /api/tables/stats/     - Xem thống kê bàn

# 🔒 ADMIN ONLY:
# POST   /api/tables/           - Tạo bàn mới
# PATCH  /api/tables/{id}/      - Cập nhật thông tin bàn (name, floor)
# DELETE /api/tables/{id}/      - Xóa bàn (soft delete)

# ======================================================================
# QUERY PARAMETERS cho GET /api/tables/:
# ======================================================================
# ?floor=1           - Lọc theo tầng
# ?status=available  - Lọc theo trạng thái (available/unavailable)
# ?search=Bàn 1      - Tìm kiếm theo tên bàn

# ======================================================================
# BODY EXAMPLES:
# ======================================================================

# POST /api/tables/ (Admin only):
# {
#   "name": "Bàn 1",
#   "floor": 1,
#   "status": "available"
# }

# PATCH /api/tables/{id}/ (Admin only):
# {
#   "name": "Bàn 1A",
#   "floor": 2
# }

# PATCH /api/tables/{id}/status/ (Staff + Admin):
# {
#   "status": "unavailable"
# }