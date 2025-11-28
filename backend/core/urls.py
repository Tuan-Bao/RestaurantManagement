"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .dashboard import (
    dashboard_stats, recent_orders, top_menu_items, revenue_by_day,
    staff_dashboard_stats, staff_active_orders, staff_alerts,
    insights_most_expensive, insights_order_history, insights_peak_hours,
    insights_staff_performance
)
from orders.views import momo_ipn_callback, trigger_momo_callback

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/tables/', include('tables.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/menu/', include('menu.urls')),
    path('api/orders/', include('orders.urls')),
    
    # MoMo IPN Callback (must be before other patterns)
    path('api/payments/momo/callback/', momo_ipn_callback, name='momo-ipn-callback'),
    path('api/payments/momo/trigger-callback/', trigger_momo_callback, name='momo-trigger-callback'),
    
    # Dashboard endpoints
    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('api/dashboard/recent-orders/', recent_orders, name='dashboard-recent-orders'),
    path('api/dashboard/top-items/', top_menu_items, name='dashboard-top-items'),
    path('api/dashboard/revenue-by-day/', revenue_by_day, name='dashboard-revenue-by-day'),
    
    # Staff Dashboard endpoints
    path('api/dashboard/staff/stats/', staff_dashboard_stats, name='staff-dashboard-stats'),
    path('api/dashboard/staff/active-orders/', staff_active_orders, name='staff-active-orders'),
    path('api/dashboard/staff/alerts/', staff_alerts, name='staff-alerts'),
    
    # Insights endpoints
    path('api/dashboard/insights/most-expensive/', insights_most_expensive, name='insights-most-expensive'),
    path('api/dashboard/insights/order-history/', insights_order_history, name='insights-order-history'),
    path('api/dashboard/insights/peak-hours/', insights_peak_hours, name='insights-peak-hours'),
    path('api/dashboard/insights/staff-performance/', insights_staff_performance, name='insights-staff-performance'),
]
