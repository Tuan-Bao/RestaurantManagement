from django.urls import path
from .views import IngredientListCreateView, IngredientDetailView

app_name = 'inventory'

urlpatterns = [
    path('ingredients/', IngredientListCreateView.as_view(), name='ingredient-list-create'),
    path('ingredients/<int:pk>/', IngredientDetailView.as_view(), name='ingredient-detail'),
]

# APIs:
# GET    /api/inventory/ingredients/?name=...   - Danh sách nguyên liệu (Staff & Admin)
# GET    /api/inventory/ingredients/{id}/         - Chi tiết nguyên liệu (Staff & Admin)
# POST   /api/inventory/ingredients/              - Tạo mới nguyên liệu (Admin only)
# PATCH  /api/inventory/ingredients/{id}/         - Cập nhật nguyên liệu (Admin only)
# DELETE /api/inventory/ingredients/{id}/         - Xóa nguyên liệu (Admin only)
