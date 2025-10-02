from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from django.db import transaction
from decimal import Decimal
from .models import Ingredient, StockIn, StockOut
from .serializers import (
    IngredientSerializer,
    IngredientUpdateSerializer,
    StockInCreateSerializer,
    StockInSerializer, 
    StockOutCreateSerializer,
    StockOutSerializer
)
from accounts.permissions import IsAdminUser


class WarehouseListView(generics.ListAPIView):
    """
    GET /api/inventory/warehouse/ - Xem danh sách nguyên liệu trong kho
    Query parameters: name, status, low_stock
    """
    serializer_class = IngredientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Ingredient.objects.filter(deleted_at__isnull=True).order_by('id')
        
        # Filter by name
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter in ['active', 'inactive']:
            queryset = queryset.filter(status=status_filter)
        
        # Filter low stock items
        low_stock = self.request.query_params.get('low_stock')
        if low_stock == 'true':
            queryset = [ingredient for ingredient in queryset if ingredient.is_low_stock]
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if isinstance(queryset, list):  # For low_stock filter
            serializer = IngredientSerializer(queryset, many=True)
            count = len(queryset)
        else:
            serializer = self.get_serializer(queryset, many=True)
            count = queryset.count()
        
       
        low_stock_count = sum(1 for item in (queryset if isinstance(queryset, list) else queryset.all()) if item.is_low_stock)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'summary': {
                'total_ingredients': count,
                'low_stock_items': low_stock_count
            }
        })


class WarehouseUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/inventory/warehouse/{id}/ - Cập nhật tên và đơn vị nguyên liệu (Admin only)
    """
    queryset = Ingredient.objects.filter(deleted_at__isnull=True)
    serializer_class = IngredientUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    http_method_names = ['patch']  # Chỉ cho phép PATCH method
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            updated_ingredient = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Cập nhật thông tin nguyên liệu thành công',
                'data': IngredientSerializer(updated_ingredient).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Cập nhật thông tin nguyên liệu thất bại',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class StockInListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inventory/stock-in/ - Danh sách lịch sử nhập kho (Admin only)
    POST /api/inventory/stock-in/ - Nhập kho mới (Admin only) - Tự động tạo/cập nhật nguyên liệu
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = StockIn.objects.select_related('ingredient', 'user').order_by('-id')
        
        # Filter by ingredient name
        ingredient_name = self.request.query_params.get('ingredient_name')
        if ingredient_name:
            queryset = queryset.filter(ingredient__name__icontains=ingredient_name)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
            
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StockInCreateSerializer
        return StockInSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = StockInSerializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'summary': {
                'total_records': queryset.count(),
            }
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # Lấy thông tin từ serializer
                ingredient_name = serializer.validated_data['ingredient_name']
                ingredient_unit = serializer.validated_data['ingredient_unit']
                min_quantity = serializer.validated_data.get('min_quantity', 0)
                quantity = serializer.validated_data['quantity']
                price = serializer.validated_data.get('price')
                
                # Tìm hoặc tạo nguyên liệu
                ingredient, created = Ingredient.objects.get_or_create(
                    name=ingredient_name,
                    defaults={
                        'unit': ingredient_unit,
                        'stock_quantity': 0,
                        'min_quantity': min_quantity,
                        'status': 'active'
                    }
                )
                
                # Nếu nguyên liệu đã tồn tại, cập nhật thông tin cần thiết
                if not created:
                    ingredient.unit = ingredient_unit
                    if ingredient.deleted_at:  # Khôi phục nếu đã bị xóa mềm
                        ingredient.deleted_at = None
                        ingredient.status = 'active'
                
                # Cập nhật tồn kho
                previous_quantity = ingredient.stock_quantity or 0
                ingredient.stock_quantity = (ingredient.stock_quantity or 0) + quantity
                
                # Tự động cập nhật status dựa trên quantity
                if ingredient.stock_quantity > 0:
                    ingredient.status = 'active'
                elif ingredient.stock_quantity == 0:
                    ingredient.status = 'inactive'
                
                # Cập nhật giá nếu có
                if price and quantity > 0:
                    ingredient.price_per_unit = price / quantity
                
                ingredient.save()
                
                # Tạo bản ghi nhập kho
                stock_in = StockIn.objects.create(
                    ingredient=ingredient,
                    quantity=quantity,
                    price=price,
                    user=request.user
                )
                
                return Response({
                    'success': True,
                    'message': f'Stock-in success - {"Create" if created else "Update"} ingredient',
                    'data': StockInSerializer(stock_in).data,
                    'ingredient_update': {
                        'ingredient_name': ingredient.name,
                        'previous_quantity': float(previous_quantity),
                        'incoming_quantity': float(quantity),
                        'new_quantity': float(ingredient.stock_quantity),
                        'is_new_ingredient': created
                    }
                }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Stock-in failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class StockInDetailView(generics.RetrieveAPIView):
    """
    GET /api/inventory/stock-in/{id}/ - Chi tiết phiếu nhập kho (Admin only)
    """
    queryset = StockIn.objects.select_related('ingredient', 'user')
    serializer_class = StockInSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def retrieve(self, request, *args, **kwargs):
        stock_in = self.get_object()
        serializer = self.get_serializer(stock_in)
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class StockOutListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inventory/stock-out/ - Danh sách lịch sử xuất kho (Admin only)
    POST /api/inventory/stock-out/ - Xuất kho thủ công (Admin only) - Tự động cập nhật tồn kho
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = StockOut.objects.select_related('ingredient', 'user').order_by('-id')
        
        # Filter by ingredient name
        ingredient_name = self.request.query_params.get('ingredient_name')
        if ingredient_name:
            queryset = queryset.filter(ingredient__name__icontains=ingredient_name)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
            
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StockOutCreateSerializer
        return StockOutSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = StockOutSerializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'summary': {
                'total_records': queryset.count()
            }
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                ingredient_name = serializer.validated_data['ingredient_name']
                quantity = serializer.validated_data['quantity']
                reason = serializer.validated_data['reason']
                notes = serializer.validated_data.get('notes', '')
                
                try:
                    ingredient = Ingredient.objects.get(name=ingredient_name, deleted_at__isnull=True)
                except Ingredient.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': f'Ingredient "{ingredient_name}" does not exist in inventory'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Kiểm tra số lượng tồn kho
                current_stock = ingredient.stock_quantity or 0
                if current_stock < quantity:
                    return Response({
                        'success': False,
                        'message': f'Not enough stock. Current: {current_stock}, Required: {quantity}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Cập nhật tồn kho
                previous_quantity = current_stock
                ingredient.stock_quantity = current_stock - quantity
                
                # Tự động cập nhật status dựa trên quantity
                if ingredient.stock_quantity > 0:
                    ingredient.status = 'active'
                elif ingredient.stock_quantity == 0:
                    ingredient.status = 'inactive'
                
                ingredient.save()
                
                # Tạo bản ghi xuất kho
                stock_out = StockOut.objects.create(
                    ingredient=ingredient,
                    quantity=quantity,
                    reason=reason,
                    notes=notes,
                    user=request.user
                )
                
                return Response({
                    'success': True,
                    'message': 'Stock-out successfully',
                    'data': StockOutSerializer(stock_out).data,
                    'ingredient_update': {
                        'ingredient_name': ingredient.name,
                        'previous_quantity': float(previous_quantity),
                        'outgoing_quantity': float(quantity),
                        'new_quantity': float(ingredient.stock_quantity),
                        'status_changed': ingredient.status == 'inactive'
                    }
                }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Stock-out failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class StockOutDetailView(generics.RetrieveAPIView):
    """
    GET /api/inventory/stock-out/{id}/ - Chi tiết phiếu xuất kho (Admin only)
    """
    queryset = StockOut.objects.select_related('ingredient', 'user')
    serializer_class = StockOutSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def retrieve(self, request, *args, **kwargs):
        stock_out = self.get_object()
        serializer = self.get_serializer(stock_out)
        
        return Response({
            'success': True,
            'data': serializer.data
        })    