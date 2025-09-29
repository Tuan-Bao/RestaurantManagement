from django.urls import path
from .views import (
    IngredientListCreateView, 
    IngredientDetailView,
    StockInListCreateView,
    StockInDetailView,
    StockOutListCreateView,
    StockOutDetailView
)

app_name = 'inventory'

urlpatterns = [
    # Ingredient endpoints
    path('ingredients/', IngredientListCreateView.as_view(), name='ingredient-list-create'),
    path('ingredients/<int:pk>/', IngredientDetailView.as_view(), name='ingredient-detail'),
    
    # Stock-in endpoints
    path('stock-in/', StockInListCreateView.as_view(), name='stock-in-list-create'),
    path('stock-in/<int:pk>/', StockInDetailView.as_view(), name='stock-in-detail'),
    
    # Stock-out endpoints
    path('stock-out/', StockOutListCreateView.as_view(), name='stock-out-list-create'),
    path('stock-out/<int:pk>/', StockOutDetailView.as_view(), name='stock-out-detail'),
]

# APIs:
# Ingredients:
# GET    /api/inventory/ingredients/?name=...   - Danh sách nguyên liệu (Staff & Admin)
# GET    /api/inventory/ingredients/{id}/         - Chi tiết nguyên liệu (Staff & Admin)
# POST   /api/inventory/ingredients/              - Tạo mới nguyên liệu (Admin only)
# PATCH  /api/inventory/ingredients/{id}/         - Cập nhật nguyên liệu (Admin only)
# DELETE /api/inventory/ingredients/{id}/         - Xóa nguyên liệu (Admin only)

# Stock-in (Nhập kho):
# GET  /api/inventory/stock-in/?ingredient_name=...&date_from=...&date_to=... - Danh sách phiếu nhập (Staff & Admin)  
# POST /api/inventory/stock-in/                    - Tạo phiếu nhập mới (Admin only) - Tự động cập nhật kho
# GET  /api/inventory/stock-in/{id}/               - Chi tiết phiếu nhập (Staff & Admin)

# Stock-out (Xuất kho):
# GET  /api/inventory/stock-out/?ingredient_name=...&date_from=...&date_to=... - Danh sách phiếu xuất (Staff & Admin)  
# POST /api/inventory/stock-out/                   - Tạo phiếu xuất mới (Admin only) - Tự động cập nhật kho
# GET  /api/inventory/stock-out/{id}/              - Chi tiết phiếu xuất (Staff & Admin)
