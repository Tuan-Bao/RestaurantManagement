from rest_framework import serializers
from .models import Order, OrderItem, Payment
from tables.serializers import TableSerializer
from menu.serializers import MenuItemSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_id', 'quantity', 'note', 'status', 'price_each', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderSerializer(serializers.ModelSerializer):
    table = TableSerializer(read_only=True)
    table_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    order_items = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'table', 'table_id', 'status', 'order_items', 'total_amount', 'created_at', 'closed_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_amount(self, obj):
        return sum((item.quantity or 0) * (item.price_each or 0) for item in obj.order_items.all())

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'discount', 'tax', 'method', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']