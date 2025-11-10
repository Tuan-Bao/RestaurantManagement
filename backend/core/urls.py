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
    staff_dashboard_stats, staff_active_orders, staff_alerts
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/tables/', include('tables.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/menu/', include('menu.urls')),
    path('api/orders/', include('orders.urls')),
    
    # Dashboard endpoints
    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('api/dashboard/recent-orders/', recent_orders, name='dashboard-recent-orders'),
    path('api/dashboard/top-items/', top_menu_items, name='dashboard-top-items'),
    path('api/dashboard/revenue-by-day/', revenue_by_day, name='dashboard-revenue-by-day'),
    
    # Staff Dashboard endpoints
    path('api/dashboard/staff/stats/', staff_dashboard_stats, name='staff-dashboard-stats'),
    path('api/dashboard/staff/active-orders/', staff_active_orders, name='staff-active-orders'),
    path('api/dashboard/staff/alerts/', staff_alerts, name='staff-alerts'),
]
