from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum
from django.utils import timezone
from django.db import transaction

from .models import Order, OrderItem, Payment
from .serializers import (
    OrderSerializer, OrderCreateSerializer,
    OrderItemSerializer, OrderItemCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer
)
from tables.models import Table
from menu.models import MenuItem

# ===== ORDER VIEWS =====
class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/orders/?table=...&status=... - Danh sách đơn hàng
    POST /api/orders/                      - Tạo đơn hàng mới + thêm món
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Order.objects.all().order_by('-created_at')
        
        # Filter by table
        table = self.request.query_params.get('table')
        if table:
            queryset = queryset.filter(table=table)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            return Response({
                'success': True,
                'message': 'Created order successfully',
                'data': OrderSerializer(order).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Created order failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class OrderDetailView(generics.RetrieveAPIView):
    """
    GET   /api/orders/{id}/ - Chi tiết đơn hàng
    """
    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    
    def retrieve(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = self.get_serializer(order)
        return Response({
            'success': True,
            'data': serializer.data
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_by_table_view(request, table_id):
    """
    GET /api/orders/table/{table_id}/ - Xem chi tiết đơn hàng theo bàn
    """
    try:
        table = Table.objects.get(pk=table_id, deleted_at__isnull=True)
    except Table.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Table not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Lấy đơn hàng chưa thanh toán của bàn
    order = Order.objects.filter(table=table, status='unpaid').first()
    
    if order:
        serializer = OrderSerializer(order)
        return Response({
            'success': True,
            'data': serializer.data
        })
    else:
        return Response({
            'success': True,
            'message': 'No unpaid order found for this table',
            'data': None
        })

# ===== ORDER ITEM VIEWS =====
class OrderItemBulkUpdateView(APIView):
    """
    PATCH /api/orders/{order_id}/items/ - Quản lý món trong đơn hàng
    - Nếu menu_item đã có: cập nhật quantity, note, status
    - Nếu menu_item mới: thêm vào đơn
    - Nếu menu_item không có trong request: xóa khỏi đơn
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if order.status == 'paid':
            return Response({
                'success': False,
                'message': 'Cannot update items in paid order'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        if not isinstance(data, list):
            return Response({
                'success': False,
                'message': 'Body must be a list of items'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Build dict for quick lookup: menu_item_id -> item_data
        incoming_items = {}
        for item_data in data:
            if 'menu_item' in item_data:
                incoming_items[item_data['menu_item']] = item_data
        
        # Get current order items
        current_items = OrderItem.objects.filter(order=order)
        current_menu_items = set(item.menu_item_id for item in current_items)
        incoming_menu_items = set(incoming_items.keys())
        
        updated = []
        added = []
        removed = []
        errors = []
        
        with transaction.atomic():
            # Update existing items or remove items not in incoming
            for order_item in current_items:
                if order_item.menu_item_id in incoming_menu_items:
                    # Update existing item
                    item_data = incoming_items[order_item.menu_item_id]
                    
                    # Update fields manually since we don't have serializer
                    if 'quantity' in item_data:
                        if item_data['quantity'] > 0:
                            order_item.quantity = item_data['quantity']
                        else:
                            errors.append({'error': 'Quantity must be greater than 0'})
                            continue
                    
                    if 'note' in item_data:
                        order_item.note = item_data['note']
                    
                    if 'status' in item_data:
                        valid_statuses = ['ordered', 'cooking', 'done', 'cancelled']
                        if item_data['status'] in valid_statuses:
                            order_item.status = item_data['status']
                        else:
                            errors.append({'error': f'Invalid status: {item_data["status"]}'})
                            continue
                    
                    order_item.save()
                    updated.append(OrderItemSerializer(order_item).data)
                else:
                    # Remove item not in incoming (chỉ xóa nếu status = ordered)
                    if order_item.status == 'ordered':
                        removed.append(order_item.menu_item_id)
                        order_item.delete()
                    else:
                        errors.append({'error': f'Cannot delete item {order_item.id} with status "{order_item.status}"'})
            
            # Add new menu items
            for menu_item_id in incoming_menu_items - current_menu_items:
                item_data = incoming_items[menu_item_id]
                try:
                    menu_item = MenuItem.objects.get(pk=menu_item_id, deleted_at__isnull=True)
                    order_item = OrderItem.objects.create(
                        order=order,
                        menu_item=menu_item,
                        user=request.user,
                        quantity=item_data.get('quantity', 1),
                        note=item_data.get('note', ''),
                        price_each=menu_item.price,
                        status='ordered'
                    )
                    added.append(OrderItemSerializer(order_item).data)
                except MenuItem.DoesNotExist:
                    errors.append({'error': f'Menu item {menu_item_id} not found'})
                except Exception as e:
                    errors.append({'error': str(e)})
        
        return Response({
            'success': True,
            'message': 'Bulk updated order items',
            'updated': updated,
            'added': added,
            'removed': removed,
            'errors': errors if errors else None
        })

class OrderItemStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/orders/items/{id}/status/ - Cập nhật trạng thái món
    """
    queryset = OrderItem.objects.all()
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        order_item = self.get_object()
        
        if order_item.order.status == 'paid':
            return Response({
                'success': False,
                'message': 'Cannot update item in paid order'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        status_value = request.data.get('status')
        if not status_value:
            return Response({
                'success': False,
                'message': 'Status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status values
        valid_statuses = ['ordered', 'cooking', 'done', 'cancelled']
        if status_value not in valid_statuses:
            return Response({
                'success': False,
                'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order_item.status = status_value
        order_item.save()
        
        return Response({
            'success': True,
            'message': 'Updated order item status successfully',
            'data': OrderItemSerializer(order_item).data
        })

class OrderItemDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/orders/items/{id}/ - Xóa món khỏi đơn
    """
    queryset = OrderItem.objects.all()
    permission_classes = [IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        order_item = self.get_object()
        
        if order_item.order.status == 'paid':
            return Response({
                'success': False,
                'message': 'Cannot delete item from paid order'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if order_item.status != 'ordered':
            return Response({
                'success': False,
                'message': 'Can only delete items with status "ordered"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order_item.delete()
        return Response({
            'success': True,
            'message': 'Deleted order item successfully'
        }, status=status.HTTP_204_NO_CONTENT)

# ===== PAYMENT VIEWS =====
class PaymentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/orders/{order_id}/payments/ - Danh sách thanh toán của đơn
    POST /api/orders/{order_id}/payments/ - Tạo thanh toán + đóng đơn tự động
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        order_id = self.kwargs.get('order_id')
        return Payment.objects.filter(order_id=order_id)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        order_id = self.kwargs.get('order_id')
        
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if order.status == 'paid':
            return Response({
                'success': False,
                'message': 'Order already paid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # Tạo payment
                payment = serializer.save(order=order)
                
                # Tự động đóng đơn
                order.status = 'paid'
                order.closed_at = timezone.now()
                order.save()
                
                # Cập nhật trạng thái bàn về available
                if order.table:
                    order.table.status = 'available'
                    order.table.save()
            
            return Response({
                'success': True,
                'message': 'Payment created and order closed successfully',
                'data': PaymentSerializer(payment).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Payment failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# ===== STATISTICS =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_stats_view(request):
    """
    GET /api/orders/stats/ - Thống kê đơn hàng
    """
    orders = Order.objects.all()
    
    # Thống kê theo trạng thái
    stats = {
        'total_orders': orders.count(),
        'unpaid_orders': orders.filter(status='unpaid').count(),
        'paid_orders': orders.filter(status='paid').count(),
        'today_orders': orders.filter(created_at__date=timezone.now().date()).count(),
        'today_revenue': 0
    }
    
    # Tính doanh thu hôm nay
    today_payments = Payment.objects.filter(created_at__date=timezone.now().date())
    today_revenue = today_payments.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    stats['today_revenue'] = float(today_revenue)
    
    return Response({
        'success': True,
        'message': 'Retrieved order statistics successfully',
        'data': stats
    })
