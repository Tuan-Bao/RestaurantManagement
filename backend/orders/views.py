from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta

from .models import Order, OrderItem, Payment
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderHistorySerializer,
    OrderItemSerializer, OrderItemCreateSerializer, OrderItemStatusUpdateSerializer,
    PaymentSerializer, PaymentCreateSerializer
)
from tables.models import Table
from menu.models import MenuItem

# ===== ORDER VIEWS =====
class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/orders/?table=...&status=...&floor=...&date_from=...&date_to=... - Danh sách đơn hàng + lịch sử
    POST /api/orders/                      - Tạo đơn hàng mới + thêm món
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Order.objects.select_related('table', 'user').prefetch_related(
            'order_items__menu_item',
            'payments'  # Prefetch payments for efficiency
        )
        
        # Custom ordering: floor (asc) → table_name (asc) → order_id (desc)
        queryset = queryset.order_by('table__floor', 'table__name', '-id')
        
        # Filter by table
        table = self.request.query_params.get('table')
        if table:
            queryset = queryset.filter(table=table)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        # Filter by floor (through table)
        floor = self.request.query_params.get('floor')
        if floor:
            try:
                floor_int = int(floor)
                queryset = queryset.filter(table__floor=floor_int)
            except (ValueError, TypeError):
                pass
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d')
                queryset = queryset.filter(created_at__date__gte=from_date.date())
            except ValueError:
                pass
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d')
                queryset = queryset.filter(created_at__date__lte=to_date.date())
            except ValueError:
                pass
        
        # Filter by table name (search)
        table_name = self.request.query_params.get('table_name')
        if table_name:
            queryset = queryset.filter(table__name__icontains=table_name)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        # Use OrderHistorySerializer for list view (history)
        return OrderHistorySerializer
    
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
                'data': OrderSerializer(order).data  # Use detailed serializer for response
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
    Logic mới:
    - Món đã có + status ordered: cập nhật số lượng
    - Món không có trong mảng + status ordered/cancelled: xóa
    - Món không có trong mảng + status cooking/done: không xóa, báo lỗi
    - Món mới: thêm với status ordered
    - Món đã có + status cooking/done: tạo record mới với status ordered
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
        
        # Build dict for quick lookup: menu_item_id -> quantity
        incoming_items = {}
        for item_data in data:
            if 'menu_item' in item_data and 'quantity' in item_data:
                if item_data['quantity'] <= 0:
                    return Response({
                        'success': False,
                        'message': 'Quantity must be greater than 0'
                    }, status=status.HTTP_400_BAD_REQUEST)
                incoming_items[item_data['menu_item']] = {
                    'quantity': item_data['quantity'],
                    'note': item_data.get('note', '')
                }
        
        # Get current order items
        current_items = OrderItem.objects.filter(order=order)
        incoming_menu_item_ids = set(incoming_items.keys())
        
        updated = []
        added = []
        removed = []
        errors = []
        
        with transaction.atomic():
            # Process existing items
            for order_item in current_items:
                menu_item_id = order_item.menu_item_id
                
                if menu_item_id in incoming_menu_item_ids:
                    # Món có trong mảng đầu vào
                    if order_item.status == 'ordered':
                        # Cập nhật số lượng nếu status là ordered
                        item_data = incoming_items[menu_item_id]
                        order_item.quantity = item_data['quantity']
                        order_item.note = item_data['note']
                        order_item.save()
                        updated.append(OrderItemSerializer(order_item).data)
                    
                    elif order_item.status == 'cooking':
                        # Tạo record mới nếu status là cooking
                        existing_ordered = OrderItem.objects.filter(
                            order=order,
                            menu_item_id=menu_item_id,
                            status='ordered'
                        ).exists()
                        if existing_ordered:
                            pass  # Đã có record ordered, bỏ qua
                        else:
                            item_data = incoming_items[menu_item_id]
                            try:
                                new_order_item = OrderItem.objects.create(
                                    order=order,
                                    menu_item=order_item.menu_item,
                                    quantity=item_data['quantity'],
                                    note=item_data['note'],
                                    price_each=order_item.menu_item.price,
                                    status='ordered'
                                )
                                added.append(OrderItemSerializer(new_order_item).data)
                            except Exception as e:
                                errors.append({'error': f'Failed to add new item for menu_item {menu_item_id}: {str(e)}'})
                    
                    elif order_item.status == 'done':
                        # Kiểm tra xem đã có record khác với status 'ordered' chưa
                        existing_ordered = OrderItem.objects.filter(
                            order=order,
                            menu_item_id=menu_item_id,
                            status='ordered'
                        ).exists()
                        
                        # Kiểm tra xem có record cooking không
                        existing_cooking = OrderItem.objects.filter(
                            order=order,
                            menu_item_id=menu_item_id,
                            status='cooking'
                        ).exists()
                        
                        if existing_ordered:
                            # Đã có record ordered, bỏ qua
                            pass
                        elif existing_cooking:
                            # Có record cooking, chuyển quyền cho cooking tạo record
                            pass
                        else:
                            # Chưa có record ordered và cooking, tạo mới
                            item_data = incoming_items[menu_item_id]
                            try:
                                new_order_item = OrderItem.objects.create(
                                    order=order,
                                    menu_item=order_item.menu_item,
                                    quantity=item_data['quantity'],
                                    note=item_data['note'],
                                    price_each=order_item.menu_item.price,
                                    status='ordered'
                                )
                                added.append(OrderItemSerializer(new_order_item).data)
                            except Exception as e:
                                errors.append({'error': f'Failed to add new item for menu_item {menu_item_id}: {str(e)}'})
                else:
                    # Món không có trong mảng đầu vào
                    if order_item.status in ['ordered', 'cancelled']:
                        # Xóa nếu status là ordered/cancelled
                        removed.append({
                            'menu_item_id': menu_item_id,
                            'menu_item_name': order_item.menu_item.name,
                            'quantity': order_item.quantity,
                            'status': order_item.status
                        })
                        order_item.delete()
                    
                    elif order_item.status in ['cooking', 'done']:
                        # Không xóa nếu status là cooking/done, báo lỗi
                        errors.append({
                            'menu_item_id': menu_item_id,
                            'menu_item_name': order_item.menu_item.name,
                            'status': order_item.status,
                            'message': f'Cannot remove item "{order_item.menu_item.name}" with status "{order_item.status}"'
                        })
            
            # Add completely new menu items
            existing_menu_item_ids = set(item.menu_item_id for item in current_items)
            new_menu_item_ids = incoming_menu_item_ids - existing_menu_item_ids
            
            for menu_item_id in new_menu_item_ids:
                item_data = incoming_items[menu_item_id]
                try:
                    menu_item = MenuItem.objects.get(pk=menu_item_id, deleted_at__isnull=True)
                    new_order_item = OrderItem.objects.create(
                        order=order,
                        menu_item=menu_item,
                        quantity=item_data['quantity'],
                        note=item_data['note'],
                        price_each=menu_item.price,
                        status='ordered'
                    )
                    added.append(OrderItemSerializer(new_order_item).data)
                except MenuItem.DoesNotExist:
                    errors.append({'error': f'Menu item {menu_item_id} not found'})
                except Exception as e:
                    errors.append({'error': f'Failed to add menu item {menu_item_id}: {str(e)}'})
        
        return Response({
            'success': True,
            'message': 'Successfully updated order items',
            'updated': updated,
            'added': added,
            'removed': removed,
            'errors': errors if errors else None
        })

# ===== PAYMENT VIEWS =====
class PaymentCreateView(generics.CreateAPIView):
    """
    POST /api/orders/{order_id}/payments/ - Tạo thanh toán + đóng đơn tự động
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentCreateSerializer
    
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
                # Tính total_amount từ order items
                total_amount = sum(
                    (item.quantity or 0) * (item.price_each or 0) 
                    for item in order.order_items.all()
                )
                
                # Lấy discount và tax từ request
                discount = serializer.validated_data.get('discount', 0)
                tax = serializer.validated_data.get('tax', 0)
                method = serializer.validated_data['method']
                
                # Tính amount = total_amount - discount - tax
                calculated_amount = total_amount - discount - tax
                
                if calculated_amount <= 0:
                    return Response({
                        'success': False,
                        'message': f'Calculated amount must be greater than 0. Total: {total_amount}, Discount: {discount}, Tax: {tax}, Result: {calculated_amount}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Tạo payment với amount được tính tự động
                payment = Payment.objects.create(
                    order=order,
                    amount=calculated_amount,
                    discount=discount,
                    tax=tax,
                    method=method
                )
                
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
                'data': PaymentSerializer(payment).data,
                'calculation': {
                    'total_amount': float(total_amount),
                    'discount': float(discount),
                    'tax': float(tax),
                    'final_amount': float(calculated_amount)
                }
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

# ===== ORDER ITEM STATUS UPDATE =====
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
        
        old_status = order_item.status
        
        # Validate status transitions based on business rules
        if status_value == 'cooking' and old_status != 'ordered':
            return Response({
                'success': False,
                'message': f'Cannot change to "cooking" from "{old_status}". Only items with status "ordered" can be changed to "cooking".'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if status_value == 'done' and old_status != 'cooking':
            return Response({
                'success': False,
                'message': f'Cannot change to "done" from "{old_status}". Only items with status "cooking" can be changed to "done".'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if status_value == 'cancelled' and old_status == 'done':
            return Response({
                'success': False,
                'message': f'Cannot change to "cancelled" from "{old_status}". Items with status "done" cannot be cancelled.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent changing from same status to same status
        if old_status == status_value:
            return Response({
                'success': False,
                'message': f'Item is already in "{status_value}" status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        order_item.status = status_value
        order_item.save()
        
        return Response({
            'success': True,
            'message': f'Updated order item status from "{old_status}" to "{status_value}"',
            'data': OrderItemSerializer(order_item).data
        })
