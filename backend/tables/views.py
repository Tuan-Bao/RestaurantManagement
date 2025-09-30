from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from django.db import transaction

from .models import Table
from .serializers import (
    TableSerializer, 
    TableCreateSerializer, 
    TableUpdateSerializer,
    TableStatusSerializer,
    TableChangeSerializer
)
from accounts.permissions import IsAdminUser

class TableListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/tables/ - Lấy danh sách bàn (Staff + Admin)
    POST /api/tables/ - Tạo bàn mới (Admin only)
    """
    def get_queryset(self):
        queryset = Table.objects.filter(deleted_at__isnull=True)
        
        # Filter by floor
        floor = self.request.query_params.get('floor', None)
        if floor:
            queryset = queryset.filter(floor=floor)
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('floor', 'name')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TableCreateSerializer
        return TableSerializer
    
    def get_permissions(self):
        """POST chỉ admin, GET cho tất cả user đã đăng nhập"""
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'message': 'Retrieved tables successfully',
            'data': serializer.data,
            'total': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            table = serializer.save()
            return Response({
                'success': True,
                'message': 'Created table successfully',
                'data': TableSerializer(table).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Created table failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/tables/{id}/ - Lấy thông tin bàn (Staff + Admin)
    PATCH  /api/tables/{id}/ - Cập nhật bàn (Admin only)
    DELETE /api/tables/{id}/ - Xóa bàn (Admin only)
    """
    def get_queryset(self):
        return Table.objects.filter(deleted_at__isnull=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return TableSerializer
        return TableUpdateSerializer
    
    def get_permissions(self):
        """PATCH, DELETE chỉ admin, GET cho tất cả user"""
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def update(self, request, *args, **kwargs):
        table = self.get_object()
        serializer = self.get_serializer(table, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated table successfully',
                'data': TableSerializer(table).data
            })
        
        return Response({
            'success': False,
            'message': 'Updated table failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        table = self.get_object()
        
        # Kiểm tra bàn có đang được sử dụng không
        if table.status == 'unavailable':
            return Response({
                'success': False,
                'message': 'Cannot delete table that is currently occupied'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Soft delete
        table.deleted_at = timezone.now()
        table.save()
        
        return Response({
            'success': True,
            'message': 'Deleted table successfully'
        }, status=status.HTTP_204_NO_CONTENT)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])  # Staff + Admin có thể thay đổi status
def table_status_view(request, pk):
    """
    PATCH /api/tables/{id}/status/ - Thay đổi trạng thái bàn (Staff + Admin)
    """
    try:
        table = Table.objects.get(pk=pk, deleted_at__isnull=True)
    except Table.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Table not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = TableStatusSerializer(table, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': f'Table status changed to {table.status}',
            'data': TableSerializer(table).data
        })
    
    return Response({
        'success': False,
        'message': 'Status change failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Staff + Admin
def table_stats_view(request):
    """
    GET /api/tables/stats/ - Thống kê bàn (Staff + Admin)
    """
    tables = Table.objects.filter(deleted_at__isnull=True)
    
    stats = {
        'total': tables.count(),
        'available': tables.filter(status='available').count(),
        'unavailable': tables.filter(status='unavailable').count(),
        'by_floor': {}
    }
    
    # Thống kê theo tầng
    floors = tables.values_list('floor', flat=True).distinct().order_by('floor')
    for floor in floors:
        if floor:  # Bỏ qua None values
            floor_tables = tables.filter(floor=floor)
            stats['by_floor'][f'floor_{floor}'] = {
                'total': floor_tables.count(),
                'available': floor_tables.filter(status='available').count(),
                'unavailable': floor_tables.filter(status='unavailable').count(),
            }
    
    return Response({
        'success': True,
        'message': 'Retrieved table statistics successfully',
        'data': stats
    })


# ===== TABLE ORDER VIEW =====

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def table_change_view(request):
    """
    POST /api/tables/change/ - Chuyển bàn cho order (Staff + Admin)
    Business Rules:
    - Bàn nguồn phải có status 'unavailable' (có order unpaid)
    - Bàn đích phải có status 'available'
    - Bàn nguồn sẽ thành 'available' sau khi chuyển
    - Bàn đích sẽ thành 'unavailable' sau khi nhận order
    """
    serializer = TableChangeSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                from_table_id = serializer.validated_data['from_table_id']
                to_table_id = serializer.validated_data['to_table_id']
                
                from django.apps import apps
                Order = apps.get_model('orders', 'Order')
                
                # Get tables
                from_table = Table.objects.get(id=from_table_id)
                to_table = Table.objects.get(id=to_table_id)
                
                # Get all unpaid orders from source table
                orders_to_move = Order.objects.filter(
                    table_id=from_table_id, 
                    status='unpaid'
                )
                
                if not orders_to_move.exists():
                    return Response({
                        'success': False,
                        'message': 'No unpaid orders found to move'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Move orders to new table
                moved_count = orders_to_move.update(table_id=to_table_id)
                
                # Update table statuses
                # Bàn nguồn thành available (không còn order)
                from_table.status = 'available'
                from_table.save()
                
                # Bàn đích thành unavailable (có order)
                to_table.status = 'unavailable'
                to_table.save()
                
                return Response({
                    'success': True,
                    'message': f'Successfully moved {moved_count} order(s) from {from_table.name} to {to_table.name}',
                    'data': {
                        'moved_orders_count': moved_count,
                        'from_table': {
                            'id': from_table.id,
                            'name': from_table.name,
                            'status': from_table.status
                        },
                        'to_table': {
                            'id': to_table.id,
                            'name': to_table.name,
                            'status': to_table.status
                        }
                    }
                }, status=status.HTTP_200_OK)
                
        except Table.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Table not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Table change failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'message': 'Table change failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# ===== TABLE ORDER VIEW =====# ===== TABLE ORDER VIEW =====
class TableOrderView(APIView):
    """
    GET /api/tables/{id}/order/ - Lấy order unpaid của bàn (status unavailable)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            table = Table.objects.get(pk=pk, deleted_at__isnull=True)
        except Table.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Table not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Kiểm tra bàn có trạng thái unavailable (có khách)
        if table.status != 'unavailable':
            return Response({
                'success': False,
                'message': f'Table is {table.status}. Only unavailable tables have active orders.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Lấy order unpaid duy nhất của bàn
        order = table.orders.filter(status='unpaid').first()
        
        if not order:
            return Response({
                'success': False,
                'message': 'No unpaid order found for this table'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Import OrderSerializer từ orders app
        from orders.serializers import OrderSerializer
        
        serializer = OrderSerializer(order)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'table_info': {
                'table_id': table.id,
                'table_name': table.name,
                'floor': table.floor,
                'status': table.status
            }
        })
