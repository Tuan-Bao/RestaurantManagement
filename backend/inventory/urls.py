from django.urls import path
from .views import (
    WarehouseListView,
    WarehouseUpdateView,
    StockInListCreateView,
    StockInDetailView,
    StockOutListCreateView,
    StockOutDetailView
)

app_name = 'inventory'

urlpatterns = [
    # Warehouse (Kho) endpoints - Xem danh sách nguyên liệu trong kho
    path('warehouse/', WarehouseListView.as_view(), name='warehouse-list'),
    path('warehouse/<int:pk>/', WarehouseUpdateView.as_view(), name='warehouse-update'),
    
    # Stock-in endpoints - Nhập kho (tự động tạo/cập nhật nguyên liệu)
    path('stock-in/', StockInListCreateView.as_view(), name='stock-in-list-create'),
    path('stock-in/<int:pk>/', StockInDetailView.as_view(), name='stock-in-detail'),
    
    # Stock-out endpoints - Xuất kho (cập nhật tồn kho)
    path('stock-out/', StockOutListCreateView.as_view(), name='stock-out-list-create'),
    path('stock-out/<int:pk>/', StockOutDetailView.as_view(), name='stock-out-detail'),
]

# APIs:
# Warehouse (Kho):
# GET    /api/inventory/warehouse/?name=...&status=...   - Xem danh sách nguyên liệu trong kho (Staff & Admin)
# PATCH  /api/inventory/warehouse/{id}/                  - Cập nhật tên, đơn vị và ngưỡng tối thiểu nguyên liệu (Admin only)

# Stock-in (Nhập kho):
# GET  /api/inventory/stock-in/?ingredient_name=...&date_from=...&date_to=... - Danh sách lịch sử nhập (Admin only)  
# POST /api/inventory/stock-in/                    - Nhập kho mới (Admin only) - Tự động tạo/cập nhật nguyên liệu trong kho
# GET  /api/inventory/stock-in/{id}/               - Chi tiết phiếu nhập (Admin only)

# Stock-out (Xuất kho):
# GET  /api/inventory/stock-out/?ingredient_name=...&date_from=...&date_to=... - Danh sách lịch sử xuất (Admin only)  
# POST /api/inventory/stock-out/                   - Xuất kho thủ công (Admin only) - Tự động cập nhật tồn kho
# GET  /api/inventory/stock-out/{id}/              - Chi tiết phiếu xuất (Admin only)
