from rest_framework import serializers
from .models import Order, OrderItem, Payment
from tables.models import Table
from menu.models import MenuItem

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=12, decimal_places=2, read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'menu_item_price', 'user', 'user_name', 
                 'quantity', 'note', 'status', 'price_each', 'subtotal', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_subtotal(self, obj):
        return (obj.quantity or 0) * (obj.price_each or 0)

class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'note']
        
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

class OrderSerializer(serializers.ModelSerializer):
    table_name = serializers.CharField(source='table.name', read_only=True)
    table_floor = serializers.IntegerField(source='table.floor', read_only=True)
    table_info = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'table', 'table_name', 'table_floor', 'table_info', 'status', 
                 'total_amount', 'items_count', 'created_at', 'closed_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_table_info(self, obj):
        """Get detailed table information"""
        if obj.table:
            return {
                'table_id': obj.table.id,
                'table_name': obj.table.name,
                'floor': obj.table.floor,
                'status': obj.table.status
            }
        return None
    
    def get_total_amount(self, obj):
        return sum((item.quantity or 0) * (item.price_each or 0) for item in obj.order_items.all())
    
    def get_items_count(self, obj):
        return obj.order_items.count()

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = ['table', 'items']
        
    def validate_table(self, value):
        if value and hasattr(value, 'orders'):
            # Kiểm tra xem bàn có đơn hàng chưa thanh toán không
            unpaid_orders = value.orders.filter(status='unpaid')
            if unpaid_orders.exists():
                raise serializers.ValidationError("Table already has an unpaid order")
        return value
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        
        # Tạo order
        order = Order.objects.create(**validated_data)
        
        # Tạo order items
        for item_data in items_data:
            menu_item = item_data['menu_item']
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                user=user,
                quantity=item_data['quantity'],
                note=item_data.get('note', ''),
                price_each=menu_item.price,
                status='ordered'
            )
        
        return order

class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    final_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = ['id', 'order_id', 'amount', 'discount', 'tax', 'method', 'final_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_final_amount(self, obj):
        return (obj.amount or 0) - (obj.discount or 0) + (obj.tax or 0)

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['amount', 'discount', 'tax', 'method']
        
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value