from django.urls import path
from . import views
from .views import RecipeBulkUpdateView

app_name = 'menu'

urlpatterns = [
    # Category endpoints
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # MenuItem endpoints
    path('items/', views.MenuItemListCreateView.as_view(), name='menuitem-list-create'),
    path('items/<int:pk>/', views.MenuItemDetailView.as_view(), name='menuitem-detail'),
    path('items/<int:pk>/status/', views.menu_item_status_view, name='menuitem-status'),
    
    # Recipe endpoints
    path('items/<int:menu_id>/recipes/', views.RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('items/<int:menu_id>/recipes/bulk/', RecipeBulkUpdateView.as_view(), name='recipe-bulk-update'),
]

# ======================================================================
# MENU MANAGEMENT APIs - PHÂN QUYỀN RÕ RÀNG
# ======================================================================

# 👥 STAFF + ADMIN (Đã đăng nhập):
# GET    /api/menu/categories/?name=...     - Xem danh sách danh mục
# GET    /api/menu/categories/{id}/         - Xem chi tiết danh mục + menu items
# GET    /api/menu/items/?name=...&category_id=...&status=...  - Xem danh sách món ăn
# GET    /api/menu/items/{id}/              - Xem chi tiết món ăn
# PATCH  /api/menu/items/{id}/status/       - Thay đổi trạng thái món ăn
# GET    /api/menu/items/{menu_id}/recipes/ - Xem công thức món ăn

# 🔒 ADMIN ONLY:
# POST   /api/menu/categories/              - Tạo danh mục mới
# PATCH  /api/menu/categories/{id}/         - Cập nhật danh mục
# DELETE /api/menu/categories/{id}/         - Xóa danh mục
# POST   /api/menu/items/                   - Tạo món ăn mới (có upload ảnh)
# PATCH  /api/menu/items/{id}/              - Cập nhật món ăn (có upload ảnh)
# DELETE /api/menu/items/{id}/              - Xóa món ăn
# POST   /api/menu/items/{menu_id}/recipes/ - Thêm nguyên liệu vào món
# PATCH  /api/menu/items/{menu_id}/recipes/bulk/ - Cập nhật hàng loạt nguyên liệu cho món ăn
# PATCH  /api/menu/recipes/{id}/            - Cập nhật số lượng nguyên liệu
# DELETE /api/menu/recipes/{id}/            - Xóa nguyên liệu khỏi món

# ======================================================================
# BODY EXAMPLES:
# ======================================================================

# POST /api/menu/categories/ (Admin only):
# {
#   "name": "Món chính",
#   "description": "Các món ăn chính"
# }

# POST /api/menu/items/ (Admin only) - Multipart/form-data:
# {
#   "category": 1,
#   "name": "Phở bò",
#   "description": "Phở bò truyền thống",
#   "price": 50000,
#   "status": "available",
#   "image": <file>
# }

# PATCH /api/menu/items/{id}/status/ (Staff + Admin):
# {
#   "status": "unavailable"
# }

# POST /api/menu/items/{menu_id}/recipes/ (Admin only):
# {
#   "ingredient": 1,
#   "quantity_required": 0.5
# }