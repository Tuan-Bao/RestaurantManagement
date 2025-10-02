from rest_framework import serializers
from .models import Order, OrderItem, Payment
from tables.models import Table
from menu.models import MenuItem

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=12, decimal_places=2, read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'menu_item_price', 
                 'quantity', 'note', 'status', 'price_each', 'subtotal', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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
    user_name = serializers.CharField(source='user.name', read_only=True)
    table_info = serializers.SerializerMethodField()
    order_items = serializers.SerializerMethodField()  # Changed to method field
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    items_by_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'table', 'table_name', 'table_floor', 'user', 'user_name', 'table_info', 'status', 'order_items', 
                 'total_amount', 'items_count', 'items_by_status', 'created_at', 'closed_at', 'updated_at']
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
    
    def get_order_items(self, obj):
        """Group order items by menu_item and status, sum quantities"""
        items = obj.order_items.all()
        grouped_items = {}
        
        for item in items:
            # Create unique key: menu_item_id + status
            key = f"{item.menu_item_id}_{item.status}"
            
            if key not in grouped_items:
                grouped_items[key] = {
                    'id': item.id,  # Use first item's ID as representative
                    'menu_item': item.menu_item_id,
                    'menu_item_name': item.menu_item.name,
                    'menu_item_price': item.menu_item.price,
                    'status': item.status,
                    'price_each': item.price_each,
                    'quantity': 0,
                    'note': item.note,  # Take first note
                    'created_at': item.created_at,
                    'updated_at': item.updated_at
                }
            
            # Sum quantities for same menu_item + status
            grouped_items[key]['quantity'] += item.quantity or 0
            
            # Update with latest timestamps and notes (keep most recent)
            if item.updated_at > grouped_items[key]['updated_at']:
                grouped_items[key]['updated_at'] = item.updated_at
                grouped_items[key]['note'] = item.note  # Use latest note
        
        # Convert to list and calculate subtotals
        result = []
        for item_data in grouped_items.values():
            item_data['subtotal'] = item_data['quantity'] * (item_data['price_each'] or 0)
            result.append(item_data)
        
        # Sort by menu_item name for consistent ordering
        return sorted(result, key=lambda x: x['menu_item_name'])
    
    def get_total_amount(self, obj):
        """Calculate total amount excluding cancelled items"""
        return sum(
            (item.quantity or 0) * (item.price_each or 0) 
            for item in obj.order_items.all() 
            if item.status != 'cancelled'
        )
    
    def get_items_count(self, obj):
        """Count unique menu_item + status combinations"""
        items = obj.order_items.all()
        unique_combinations = set()
        for item in items:
            unique_combinations.add(f"{item.menu_item_id}_{item.status}")
        return len(unique_combinations)
    
    def get_items_by_status(self, obj):
        """Group items by status for easy tracking"""
        items = obj.order_items.all()
        status_count = {}
        for item in items:
            status = item.status or 'ordered'
            if status not in status_count:
                status_count[status] = 0
            status_count[status] += item.quantity or 0
        return status_count

class OrderHistorySerializer(serializers.ModelSerializer):
    """Serializer for order history with comprehensive information"""
    table_name = serializers.CharField(source='table.name', read_only=True)
    table_floor = serializers.IntegerField(source='table.floor', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    table_info = serializers.SerializerMethodField()
    order_items = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    payment_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'table', 'table_name', 'table_floor', 'user', 'user_name', 'table_info', 
                 'status', 'order_items', 'total_amount', 'payment_info', 'created_at', 'closed_at', 'updated_at']
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
    
    def get_order_items(self, obj):
        """Get order items with ingredient information"""
        items = obj.order_items.select_related('menu_item').prefetch_related(
            'menu_item__recipes__ingredient'
        ).all()
        
        result = []
        for item in items:
            # Get ingredients for this menu item
            ingredients = []
            if item.menu_item and hasattr(item.menu_item, 'recipes'):
                for recipe in item.menu_item.recipes.all():
                    if recipe.ingredient:
                        ingredients.append({
                            'id': recipe.ingredient.id,
                            'name': recipe.ingredient.name,
                            'quantity_required': float(recipe.quantity_required) if recipe.quantity_required else 0,
                            'unit': recipe.ingredient.unit if hasattr(recipe.ingredient, 'unit') else ''
                        })
            
            result.append({
                'id': item.id,
                'menu_item': item.menu_item_id,
                'menu_item_name': item.menu_item.name if item.menu_item else 'N/A',
                'menu_item_price': float(item.menu_item.price) if item.menu_item and item.menu_item.price else 0,
                'quantity': item.quantity,
                'note': item.note,
                'status': item.status,
                'price_each': float(item.price_each) if item.price_each else 0,
                'subtotal': float((item.quantity or 0) * (item.price_each or 0)),
                'ingredients': ingredients,
                'created_at': item.created_at,
                'updated_at': item.updated_at
            })
        
        return result
    
    def get_total_amount(self, obj):
        """Calculate total amount excluding cancelled items"""
        return sum(
            (item.quantity or 0) * (item.price_each or 0) 
            for item in obj.order_items.all() 
            if item.status != 'cancelled'
        )
    
    def get_payment_info(self, obj):
        """Get payment information for the order"""
        payments = obj.payments.all()
        if not payments.exists():
            return None
        
        # Lấy payment đầu tiên (thường chỉ có 1 payment per order)
        payment = payments.first()
        return {
            'payment_id': payment.id,
            'amount': payment.amount,
            'discount': payment.discount,
            'tax': payment.tax,
            'final_amount': payment.amount or 0,  # Chỉ lấy amount gốc, bỏ qua discount và tax
            'method': payment.method,
            'paid_at': payment.created_at
        }

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
        
        # Tạo order với user
        order = Order.objects.create(user=user, **validated_data)
        
        # Tạo order items (không có user field nữa)
        for item_data in items_data:
            menu_item = item_data['menu_item']
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data['quantity'],
                note=item_data.get('note', ''),
                price_each=menu_item.price,
                status='ordered'
            )
        
        return order

class OrderItemStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order item status only"""
    
    class Meta:
        model = OrderItem
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status transitions"""
        if not value:
            raise serializers.ValidationError("Status is required")
        
        # Get current status if updating existing item
        if self.instance:
            current_status = self.instance.status
            
            # Define allowed status transitions
            allowed_transitions = {
                'ordered': ['cooking', 'cancel'],
                'cooking': ['done', 'cancel'],
                'done': [],  # Final state
                'cancel': []  # Final state
            }
            
            if current_status in allowed_transitions:
                if value not in allowed_transitions[current_status]:
                    raise serializers.ValidationError(
                        f"Cannot change status from '{current_status}' to '{value}'"
                    )
        
        return value

class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    final_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = ['id', 'order_id', 'amount', 'discount', 'tax', 'method', 'final_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_final_amount(self, obj):
        return obj.amount or 0  # Chỉ lấy amount gốc, bỏ qua discount và tax

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['discount', 'tax', 'method']
        
    def validate_discount(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Discount cannot be negative")
        return value or 0
        
    def validate_tax(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Tax cannot be negative")
        return value or 0