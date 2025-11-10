from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F, DecimalField
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from datetime import timedelta

from accounts.permissions import IsAdminUser
from orders.models import Order, OrderItem, Payment
from tables.models import Table
from menu.models import MenuItem, Category
from inventory.models import Ingredient


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    """
    GET /api/dashboard/stats/ - Lấy thống kê tổng quan
    """
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    month_start = today.replace(day=1)
    
    # Orders statistics
    total_orders = Order.objects.count()
    today_orders = Order.objects.filter(created_at__date=today).count()
    yesterday_orders = Order.objects.filter(created_at__date=yesterday).count()
    unpaid_orders = Order.objects.filter(status='unpaid').count()
    paid_orders = Order.objects.filter(status='paid').count()
    
    # Calculate order change percentage
    order_change = 0
    if yesterday_orders > 0:
        order_change = ((today_orders - yesterday_orders) / yesterday_orders) * 100
    elif today_orders > 0:
        order_change = 100
    
    # Revenue statistics
    total_revenue = Payment.objects.aggregate(
        total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
    )['total']
    
    today_revenue = Payment.objects.filter(
        created_at__date=today
    ).aggregate(
        total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
    )['total']
    
    yesterday_revenue = Payment.objects.filter(
        created_at__date=yesterday
    ).aggregate(
        total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
    )['total']
    
    month_revenue = Payment.objects.filter(
        created_at__date__gte=month_start
    ).aggregate(
        total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
    )['total']
    
    # Calculate revenue change percentage
    revenue_change = 0
    if yesterday_revenue > 0:
        revenue_change = ((today_revenue - yesterday_revenue) / yesterday_revenue) * 100
    elif today_revenue > 0:
        revenue_change = 100
    
    # Tables statistics
    total_tables = Table.objects.filter(deleted_at__isnull=True).count()
    available_tables = Table.objects.filter(deleted_at__isnull=True, status='available').count()
    unavailable_tables = Table.objects.filter(deleted_at__isnull=True, status='unavailable').count()
    
    # Menu statistics
    total_menu_items = MenuItem.objects.filter(deleted_at__isnull=True).count()
    available_menu_items = MenuItem.objects.filter(deleted_at__isnull=True, status='available').count()
    unavailable_menu_items = MenuItem.objects.filter(deleted_at__isnull=True, status='unavailable').count()
    total_categories = Category.objects.filter(deleted_at__isnull=True).count()
    
    # Ingredients statistics
    total_ingredients = Ingredient.objects.filter(deleted_at__isnull=True).count()
    low_stock_ingredients = Ingredient.objects.filter(
        deleted_at__isnull=True,
        stock_quantity__lt=F('min_quantity')
    ).count()
    
    return Response({
        'success': True,
        'data': {
            'orders': {
                'total': total_orders,
                'today': today_orders,
                'unpaid': unpaid_orders,
                'paid': paid_orders,
                'change_percent': round(order_change, 1)
            },
            'revenue': {
                'total': float(total_revenue),
                'today': float(today_revenue),
                'this_month': float(month_revenue),
                'change_percent': round(revenue_change, 1)
            },
            'tables': {
                'total': total_tables,
                'available': available_tables,
                'unavailable': unavailable_tables
            },
            'menu': {
                'total': total_menu_items,
                'available': available_menu_items,
                'unavailable': unavailable_menu_items,
                'categories': total_categories
            },
            'ingredients': {
                'total': total_ingredients,
                'low_stock': low_stock_ingredients
            }
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def recent_orders(request):
    """
    GET /api/dashboard/recent-orders/?limit=10 - Lấy đơn hàng gần đây
    """
    limit = int(request.GET.get('limit', 10))
    
    orders = Order.objects.select_related('table').prefetch_related(
        'order_items', 'payments'
    ).order_by('-created_at')[:limit]
    
    data = []
    for order in orders:
        # Calculate total amount from payments
        total_amount = order.payments.aggregate(
            total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
        )['total']
        
        # Count items (exclude cancelled items)
        items_count = order.order_items.exclude(
            status='cancelled'
        ).aggregate(
            total=Coalesce(Sum('quantity'), 0)
        )['total']
        
        data.append({
            'id': order.id,
            'table': {
                'id': order.table.id if order.table else None,
                'name': order.table.name if order.table else 'N/A'
            },
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'total_amount': float(total_amount),
            'items_count': items_count or 0
        })
    
    return Response({
        'success': True,
        'data': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def top_menu_items(request):
    """
    GET /api/dashboard/top-items/?limit=10&days=30 - Lấy món ăn bán chạy
    """
    limit = int(request.GET.get('limit', 10))
    days = int(request.GET.get('days', 30))
    
    date_from = timezone.now() - timedelta(days=days)
    
    # Get top selling items (exclude cancelled items)
    top_items = OrderItem.objects.filter(
        created_at__gte=date_from
    ).exclude(
        status='cancelled'
    ).values(
        'menu_item_id', 'menu_item__name'
    ).annotate(
        total_quantity=Sum('quantity'),
        total_revenue=Sum(F('quantity') * F('price_each'), output_field=DecimalField())
    ).order_by('-total_quantity')[:limit]
    
    data = [
        {
            'id': item['menu_item_id'],
            'name': item['menu_item__name'],
            'total_quantity': item['total_quantity'],
            'total_revenue': float(item['total_revenue'] or 0)
        }
        for item in top_items
    ]
    
    return Response({
        'success': True,
        'data': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def revenue_by_day(request):
    """
    GET /api/dashboard/revenue-by-day/?days=7 - Lấy doanh thu theo ngày
    """
    days = int(request.GET.get('days', 7))
    date_from = timezone.now() - timedelta(days=days)
    
    # Get revenue grouped by day
    revenue_data = Payment.objects.filter(
        created_at__gte=date_from
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        revenue=Sum('amount'),
        orders_count=Count('order_id', distinct=True)
    ).order_by('date')
    
    # Fill in missing dates with zero revenue
    result = []
    current_date = date_from.date()
    today = timezone.now().date()
    
    revenue_dict = {item['date']: item for item in revenue_data}
    
    while current_date <= today:
        if current_date in revenue_dict:
            result.append({
                'date': current_date.isoformat(),
                'revenue': float(revenue_dict[current_date]['revenue']),
                'orders_count': revenue_dict[current_date]['orders_count']
            })
        else:
            result.append({
                'date': current_date.isoformat(),
                'revenue': 0,
                'orders_count': 0
            })
        current_date += timedelta(days=1)
    
    return Response({
        'success': True,
        'data': result
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_dashboard_stats(request):
    """
    GET /api/dashboard/staff/stats/ - Lấy thống kê cho staff
    """
    today = timezone.now().date()
    
    # Tables statistics
    total_tables = Table.objects.count()
    occupied_tables = Table.objects.filter(status='occupied').count()
    available_tables = Table.objects.filter(status='available').count()
    
    # Today's orders
    today_orders = Order.objects.filter(created_at__date=today).count()
    pending_orders = Order.objects.filter(status__in=['unpaid', 'pending']).count()
    
    # Today's revenue
    today_revenue = Payment.objects.filter(
        created_at__date=today
    ).aggregate(
        total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
    )['total']
    
    # Low stock items (for alerts)
    low_stock_count = Ingredient.objects.filter(
        deleted_at__isnull=True,
        stock_quantity__lt=F('min_quantity')
    ).count()
    
    return Response({
        'success': True,
        'data': {
            'tables': {
                'total': total_tables,
                'occupied': occupied_tables,
                'available': available_tables
            },
            'orders': {
                'today': today_orders,
                'pending': pending_orders
            },
            'revenue': {
                'today': float(today_revenue)
            },
            'alerts': {
                'low_stock_count': low_stock_count
            }
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_active_orders(request):
    """
    GET /api/dashboard/staff/active-orders/ - Lấy đơn hàng đang hoạt động cho staff
    """
    # Get active orders (unpaid and pending)
    orders = Order.objects.filter(
        status__in=['unpaid', 'pending']
    ).select_related('table', 'user').prefetch_related(
        'order_items__menu_item', 'payments'
    ).order_by('-created_at')[:20]
    
    data = []
    for order in orders:
        # Calculate total amount from payments
        total_amount = order.payments.aggregate(
            total=Coalesce(Sum('amount'), 0, output_field=DecimalField())
        )['total']
        
        # Get order items (exclude cancelled)
        items = []
        total_items = 0
        for item in order.order_items.exclude(status='cancelled'):
            items.append({
                'menu_item_name': item.menu_item.name,
                'quantity': item.quantity,
                'price': float(item.price_each),
                'status': item.status
            })
            total_items += item.quantity
        
        # Calculate waiting time
        waiting_minutes = int((timezone.now() - order.created_at).total_seconds() / 60)
        
        data.append({
            'id': order.id,
            'table': {
                'id': order.table.id if order.table else None,
                'name': order.table.name if order.table else 'N/A'
            },
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'waiting_minutes': waiting_minutes,
            'total_amount': float(total_amount),
            'items_count': total_items,
            'items': items,
            'staff_name': order.user.username if order.user else 'N/A'
        })
    
    return Response({
        'success': True,
        'data': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_alerts(request):
    """
    GET /api/dashboard/staff/alerts/ - Lấy các cảnh báo cho staff
    """
    alerts = []
    
    # Check for orders waiting too long (>15 minutes)
    long_waiting_orders = Order.objects.filter(
        status__in=['unpaid', 'pending'],
        created_at__lt=timezone.now() - timedelta(minutes=15)
    ).select_related('table')[:5]
    
    for order in long_waiting_orders:
        waiting_minutes = int((timezone.now() - order.created_at).total_seconds() / 60)
        alerts.append({
            'type': 'warning',
            'icon': 'clock',
            'message': f'Bàn {order.table.name if order.table else "N/A"} chờ quá {waiting_minutes} phút',
            'order_id': order.id
        })
    
    # Check for low stock ingredients
    low_stock_items = Ingredient.objects.filter(
        deleted_at__isnull=True,
        stock_quantity__lt=F('min_quantity')
    ).values('name', 'stock_quantity', 'unit')[:5]
    
    for item in low_stock_items:
        alerts.append({
            'type': 'danger',
            'icon': 'exclamation-triangle',
            'message': f'{item["name"]} sắp hết (còn {item["stock_quantity"]} {item["unit"]})',
            'ingredient_name': item['name']
        })
    
    # Check for unavailable menu items
    unavailable_items = MenuItem.objects.filter(
        deleted_at__isnull=True,
        status='unavailable'
    ).count()
    
    if unavailable_items > 0:
        alerts.append({
            'type': 'info',
            'icon': 'info-circle',
            'message': f'Có {unavailable_items} món ăn không khả dụng',
            'count': unavailable_items
        })
    
    return Response({
        'success': True,
        'data': alerts
    })
