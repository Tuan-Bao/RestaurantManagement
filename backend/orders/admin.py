from django.contrib import admin
from .models import Order, OrderItem, Payment

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price_each',)

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'table', 'user', 'status', 'created_at', 'closed_at']
    list_filter = ['status', 'created_at']
    search_fields = ['table__name', 'table__number', 'user__name']
    ordering = ['-created_at']
    inlines = [OrderItemInline, PaymentInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('table', 'user', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'closed_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'menu_item', 'quantity', 'status', 'price_each', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['menu_item__name', 'order__id']
    ordering = ['-created_at']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'amount', 'discount', 'tax', 'method', 'created_at']
    list_filter = ['method', 'created_at']
    search_fields = ['order__id']
    ordering = ['-created_at']
