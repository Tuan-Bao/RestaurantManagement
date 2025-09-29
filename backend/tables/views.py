from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from .models import Table
from .serializers import (
    TableSerializer, 
    TableCreateSerializer, 
    TableUpdateSerializer,
    TableStatusSerializer
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


# ===== TABLE MERGE OPERATIONS =====
from django.db import transaction
from .models import TableMerge
from .serializers import (
    TableMergeSerializer, 
    TableMergeCreateSerializer,
    TableChangeSerializer
)

class TableMergeListView(generics.ListAPIView):
    """
    GET /api/tables/merges/ - Xem danh sách ghép bàn (Staff + Admin)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TableMergeSerializer
    
    def get_queryset(self):
        queryset = TableMerge.objects.all()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by main table
        main_table = self.request.query_params.get('main_table')
        if main_table:
            queryset = queryset.filter(main_table_id=main_table)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count()
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def table_merge_view(request):
    """
    POST /api/tables/merge/ - Ghép bàn (Staff + Admin)
    """
    serializer = TableMergeCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                main_table_id = serializer.validated_data['main_table_id']
                merged_table_ids = serializer.validated_data['merged_table_ids']
                
                # Get tables
                main_table = Table.objects.get(id=main_table_id)
                merged_tables = Table.objects.filter(id__in=merged_table_ids)
                
                # Create table merge record
                table_merge = TableMerge.objects.create(
                    main_table=main_table,
                    created_by=request.user
                )
                table_merge.merged_tables.set(merged_tables)
                
                # Update table status
                merged_tables.update(status='merged')
                
                # Move all orders from merged tables to main table
                from django.apps import apps
                Order = apps.get_model('orders', 'Order')
                
                for table in merged_tables:
                    table.orders.filter(status='unpaid').update(table=main_table)
                
                return Response({
                    'success': True,
                    'message': f'Successfully merged {len(merged_table_ids)} tables into {main_table.name}',
                    'data': TableMergeSerializer(table_merge).data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Table merge failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'message': 'Table merge failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def table_separate_view(request, merge_id):
    """
    POST /api/tables/merges/{merge_id}/separate/ - Tách bàn (Staff + Admin)
    """
    try:
        table_merge = TableMerge.objects.get(id=merge_id, is_active=True)
    except TableMerge.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Active table merge not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    try:
        with transaction.atomic():
            # Update merge record
            table_merge.separated_at = timezone.now()
            table_merge.separated_by = request.user
            table_merge.is_active = False
            table_merge.save()
            
            # Reset merged tables status to available
            table_merge.merged_tables.update(status='available')
            
            return Response({
                'success': True,
                'message': f'Successfully separated tables from {table_merge.main_table.name}',
                'data': TableMergeSerializer(table_merge).data
            })
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Table separation failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def table_change_view(request):
    """
    POST /api/tables/change/ - Đổi bàn cho order (Staff + Admin)
    """
    serializer = TableChangeSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                from_table_id = serializer.validated_data['from_table_id']
                to_table_id = serializer.validated_data['to_table_id']
                order_id = serializer.validated_data.get('order_id')
                
                from django.apps import apps
                Order = apps.get_model('orders', 'Order')
                
                # Get orders to move
                if order_id:
                    orders_to_move = Order.objects.filter(
                        id=order_id, 
                        table_id=from_table_id, 
                        status='unpaid'
                    )
                else:
                    orders_to_move = Order.objects.filter(
                        table_id=from_table_id, 
                        status='unpaid'
                    )
                
                if not orders_to_move.exists():
                    return Response({
                        'success': False,
                        'message': 'No orders found to move'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Move orders to new table
                moved_count = orders_to_move.update(table_id=to_table_id)
                
                from_table = Table.objects.get(id=from_table_id)
                to_table = Table.objects.get(id=to_table_id)
                
                return Response({
                    'success': True,
                    'message': f'Successfully moved {moved_count} order(s) from {from_table.name} to {to_table.name}',
                    'data': {
                        'moved_orders_count': moved_count,
                        'from_table': TableSerializer(from_table).data,
                        'to_table': TableSerializer(to_table).data
                    }
                }, status=status.HTTP_200_OK)
                
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
