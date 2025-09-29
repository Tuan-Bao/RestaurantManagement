from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    
    # User management endpoints (Admin only)
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]

# Authentication:
# POST /api/auth/login/ - Đăng nhập (set is_active = True)
# POST /api/auth/logout/ - Đăng xuất (set is_active = False)
# GET /api/auth/profile/ - Xem thông tin cá nhân
# PUT /api/auth/profile/ - Cập nhật thông tin cá nhân

# User Management (Admin only):
# GET /api/users/ - Danh sách users (có hỗ trợ filtering)
#   Query parameters: name, username, role
#   Ví dụ: /api/users/?name=Nguyen&role=staff
# POST /api/users/ - Tạo user mới
# GET /api/users/{id}/ - Xem chi tiết user
# PUT /api/users/{id}/ - Cập nhật user hoàn toàn
# PATCH /api/users/{id}/ - Cập nhật một phần user (bao gồm password)
# DELETE /api/users/{id}/ - Xóa user
#   Validation: Không được xóa chính mình, phải tồn tại ít nhất 1 admin