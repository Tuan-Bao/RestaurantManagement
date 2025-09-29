from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from django.db import transaction
from .models import Ingredient, StockIn, StockOut
from .serializers import (
    IngredientSerializer, 
    IngredientCreateUpdateSerializer,
    StockInSerializer, 
    StockOutSerializer
)
from accounts.permissions import IsAdminUser


class IngredientListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inventory/ingredients/ - Danh sách nguyên liệu với thông tin kho
    POST /api/inventory/ingredients/ - Tạo mới nguyên liệu (Admin only)
    Query parameters: name, status, low_stock
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Ingredient.objects.filter(deleted_at__isnull=True).order_by('name')
        
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
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IngredientCreateUpdateSerializer
        return IngredientSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if isinstance(queryset, list):  # For low_stock filter
            serializer = IngredientSerializer(queryset, many=True)
            count = len(queryset)
        else:
            serializer = self.get_serializer(queryset, many=True)
            count = queryset.count()
        
        # Calculate summary statistics
        total_value = sum(
            (item.stock_quantity or 0) * (item.price_per_unit or 0) 
            for item in (queryset if isinstance(queryset, list) else queryset.all())
        )
        low_stock_count = sum(1 for item in (queryset if isinstance(queryset, list) else queryset.all()) if item.is_low_stock)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'summary': {
                'total_ingredients': count,
                'total_stock_value': round(total_value, 2),
                'low_stock_items': low_stock_count
            }
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            ingredient = serializer.save(stock_quantity=0)  # Initialize with 0 stock
            return Response({
                'success': True,
                'message': 'Created ingredient successfully',
                'data': IngredientSerializer(ingredient).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Created ingredient failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class IngredientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/inventory/ingredients/{id}/ - Chi tiết nguyên liệu với lịch sử nhập/xuất
    PATCH  /api/inventory/ingredients/{id}/ - Cập nhật nguyên liệu (Admin only)
    DELETE /api/inventory/ingredients/{id}/ - Xóa nguyên liệu (Admin only)
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Ingredient.objects.filter(deleted_at__isnull=True)
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return IngredientCreateUpdateSerializer
        return IngredientSerializer
    
    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        ingredient = self.get_object()
        serializer = self.get_serializer(ingredient)
        
        # Get recent stock movements
        recent_stock_ins = StockIn.objects.filter(ingredient=ingredient).order_by('-created_at')[:5]
        recent_stock_outs = StockOut.objects.filter(ingredient=ingredient).order_by('-created_at')[:5]
        
        return Response({
            'success': True,
            'data': serializer.data,
            'recent_movements': {
                'stock_ins': StockInSerializer(recent_stock_ins, many=True).data,
                'stock_outs': StockOutSerializer(recent_stock_outs, many=True).data
            }
        })
    
    def update(self, request, *args, **kwargs):
        ingredient = self.get_object()
        serializer = self.get_serializer(ingredient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated ingredient successfully',
                'data': IngredientSerializer(ingredient).data
            })
        return Response({
            'success': False,
            'message': 'Updated ingredient failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        ingredient = self.get_object()
        from django.utils import timezone
        ingredient.deleted_at = timezone.now()
        ingredient.save()
        return Response({
            'success': True,
            'message': 'Deleted ingredient successfully'
        }, status=status.HTTP_204_NO_CONTENT)


class StockInListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inventory/stock-in/ - Danh sách phiếu nhập kho
    POST /api/inventory/stock-in/ - Tạo phiếu nhập kho mới (Admin only)
    """
    serializer_class = StockInSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = StockIn.objects.select_related('ingredient', 'user').order_by('-created_at')
        
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
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Calculate total value
        total_value = sum(stock_in.price or 0 for stock_in in queryset)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'summary': {
                'count': queryset.count(),
                'total_value': round(total_value, 2)
            },
            'filters': {
                'ingredient_name': request.query_params.get('ingredient_name'),
                'date_from': request.query_params.get('date_from'),
                'date_to': request.query_params.get('date_to')
            }
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Get current user
                    user_id = request.auth.payload.get('user_id') if request.auth else None
                    if not user_id:
                        return Response({
                            'success': False,
                            'message': 'User authentication required'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    from accounts.models import User
                    try:
                        user = User.objects.get(id=user_id, deleted_at__isnull=True)
                    except User.DoesNotExist:
                        return Response({
                            'success': False,
                            'message': 'User not found'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Create stock-in record
                    stock_in = serializer.save(user=user)
                    
                    # Update ingredient stock quantity
                    ingredient = stock_in.ingredient
                    if ingredient:
                        previous_quantity = ingredient.stock_quantity or 0
                        incoming_quantity = stock_in.quantity or 0
                        ingredient.stock_quantity = previous_quantity + incoming_quantity
                        
                        # Update price per unit if provided
                        if stock_in.price and incoming_quantity > 0:
                            new_price_per_unit = stock_in.price / incoming_quantity
                            ingredient.price_per_unit = new_price_per_unit
                        
                        ingredient.save()
                        
                        return Response({
                            'success': True,
                            'message': 'Stock-in created successfully',
                            'data': StockInSerializer(stock_in).data,
                            'stock_update': {
                                'ingredient_name': ingredient.name,
                                'previous_quantity': previous_quantity,
                                'incoming_quantity': incoming_quantity,
                                'new_quantity': ingredient.stock_quantity
                            }
                        }, status=status.HTTP_201_CREATED)
                    
                    return Response({
                        'success': True,
                        'message': 'Stock-in created successfully',
                        'data': StockInSerializer(stock_in).data
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Failed to create stock-in: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'message': 'Stock-in creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class StockInDetailView(generics.RetrieveAPIView):
    """
    GET /api/inventory/stock-in/{id}/ - Xem chi tiết phiếu nhập kho
    """
    serializer_class = StockInSerializer
    permission_classes = [IsAuthenticated]
    queryset = StockIn.objects.select_related('ingredient', 'user')


class StockOutListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inventory/stock-out/ - Danh sách phiếu xuất kho
    POST /api/inventory/stock-out/ - Tạo phiếu xuất kho mới (Admin only)
    """
    serializer_class = StockOutSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = StockOut.objects.select_related('ingredient', 'user').order_by('-created_at')
        
        # Filter by ingredient name
        ingredient_name = self.request.query_params.get('ingredient_name')
        if ingredient_name:
            queryset = queryset.filter(ingredient__name__icontains=ingredient_name)
        
        # Filter by reason
        reason = self.request.query_params.get('reason')
        if reason in ['processing', 'cancel', 'other']:
            queryset = queryset.filter(reason=reason)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
            
        return queryset
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'summary': {
                'count': queryset.count()
            },
            'filters': {
                'ingredient_name': request.query_params.get('ingredient_name'),
                'reason': request.query_params.get('reason'),
                'date_from': request.query_params.get('date_from'),
                'date_to': request.query_params.get('date_to')
            }
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Get current user
                    user_id = request.auth.payload.get('user_id') if request.auth else None
                    if not user_id:
                        return Response({
                            'success': False,
                            'message': 'User authentication required'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    from accounts.models import User
                    try:
                        user = User.objects.get(id=user_id, deleted_at__isnull=True)
                    except User.DoesNotExist:
                        return Response({
                            'success': False,
                            'message': 'User not found'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Check if enough stock available
                    ingredient = Ingredient.objects.get(id=serializer.validated_data['ingredient_id'])
                    requested_quantity = serializer.validated_data['quantity']
                    current_stock = ingredient.stock_quantity or 0
                    
                    if current_stock < requested_quantity:
                        return Response({
                            'success': False,
                            'message': f'Insufficient stock. Available: {current_stock}, Requested: {requested_quantity}'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Create stock-out record
                    stock_out = serializer.save(user=user)
                    
                    # Update ingredient stock quantity
                    ingredient.stock_quantity = current_stock - requested_quantity
                    ingredient.save()
                    
                    return Response({
                        'success': True,
                        'message': 'Stock-out created successfully',
                        'data': StockOutSerializer(stock_out).data,
                        'stock_update': {
                            'ingredient_name': ingredient.name,
                            'previous_quantity': current_stock,
                            'outgoing_quantity': requested_quantity,
                            'new_quantity': ingredient.stock_quantity
                        }
                    }, status=status.HTTP_201_CREATED)
                    
            except Ingredient.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Ingredient not found'
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Failed to create stock-out: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'message': 'Stock-out creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class StockOutDetailView(generics.RetrieveAPIView):
    """
    GET /api/inventory/stock-out/{id}/ - Xem chi tiết phiếu xuất kho
    """
    serializer_class = StockOutSerializer
    permission_classes = [IsAuthenticated]
    queryset = StockOut.objects.select_related('ingredient', 'user')

class IngredientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/inventory/ingredients/{id}/    - Chi tiết nguyên liệu
    PATCH  /api/inventory/ingredients/{id}/    - Cập nhật nguyên liệu (Admin only)
    DELETE /api/inventory/ingredients/{id}/    - Xóa nguyên liệu (Admin only)
    """
    serializer_class = IngredientSerializer
    
    def get_queryset(self):
        return Ingredient.objects.filter(deleted_at__isnull=True)
    
    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        ingredient = self.get_object()
        serializer = self.get_serializer(ingredient)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        ingredient = self.get_object()
        serializer = self.get_serializer(ingredient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated ingredient successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'Updated ingredient failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        ingredient = self.get_object()
        ingredient.deleted_at = ingredient.deleted_at or ingredient.updated_at
        ingredient.save()
        return Response({
            'success': True,
            'message': 'Deleted ingredient successfully'
        }, status=status.HTTP_204_NO_CONTENT)
