from rest_framework import serializers
from .models import Ingredient, StockIn, StockOut
from accounts.serializers import UserSerializer


class IngredientSerializer(serializers.ModelSerializer):
    """Serializer cho kho nguyên liệu (chỉ đọc)"""
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Ingredient
        fields = [
            'id', 'name', 'unit', 'stock_quantity', 'min_quantity', 
            'price_per_unit', 'status', 'is_low_stock',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_low_stock', 'created_at', 'updated_at']


class IngredientUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho cập nhật thông tin nguyên liệu (name, unit, min_quantity)"""
    name = serializers.CharField(max_length=200, help_text="Tên nguyên liệu")
    unit = serializers.ChoiceField(
        choices=Ingredient.UNIT_CHOICES, 
        help_text="Đơn vị tính"
    )
    min_quantity = serializers.DecimalField(
        max_digits=12, 
        decimal_places=3, 
        min_value=0,
        required=False,
        help_text="Ngưỡng tối thiểu để cảnh báo sắp hết hàng"
    )
    
    class Meta:
        model = Ingredient
        fields = ['name', 'unit', 'min_quantity']
        
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Tên nguyên liệu không được để trống")
        
        # Kiểm tra trùng tên (ngoại trừ ingredient hiện tại)
        instance = getattr(self, 'instance', None)
        if instance:
            existing = Ingredient.objects.filter(
                name__iexact=value.strip(),
                deleted_at__isnull=True
            ).exclude(id=instance.id)
        else:
            existing = Ingredient.objects.filter(
                name__iexact=value.strip(),
                deleted_at__isnull=True
            )
            
        if existing.exists():
            raise serializers.ValidationError("Tên nguyên liệu đã tồn tại")
        
        return value.strip()
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.unit = validated_data.get('unit', instance.unit)
        instance.min_quantity = validated_data.get('min_quantity', instance.min_quantity)
        instance.save()
        return instance


class StockInCreateSerializer(serializers.ModelSerializer):
    """Serializer cho nhập kho - có thể tạo nguyên liệu mới hoặc cập nhật nguyên liệu có sẵn"""
    # Thông tin nguyên liệu
    ingredient_name = serializers.CharField(max_length=200, help_text="Tên nguyên liệu")
    ingredient_unit = serializers.ChoiceField(
        choices=Ingredient.UNIT_CHOICES, 
        help_text="Đơn vị tính"
    )
    min_quantity = serializers.DecimalField(
        max_digits=12, decimal_places=3, required=False, default=0,
        help_text="Number of minimum stock threshold for alert"
    )
    
    # Thông tin nhập kho
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, help_text="Số lượng nhập")
    price = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True,
        help_text="Sum of the total price for this stock-in (can be null)"
    )
    
    class Meta:
        model = StockIn
        fields = [
            'ingredient_name', 'ingredient_unit', 'min_quantity',
            'quantity', 'price'
        ]
        
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number of stock-in must be greater than 0")
        return value
        
    def validate_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value


class StockInSerializer(serializers.ModelSerializer):
    """Serializer cho hiển thị lịch sử nhập kho"""
    ingredient = IngredientSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    price_per_unit = serializers.ReadOnlyField()
    
    class Meta:
        model = StockIn
        fields = ['id', 'ingredient', 'quantity', 'price', 'price_per_unit', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at', 'price_per_unit']


class StockOutCreateSerializer(serializers.ModelSerializer):
    """Serializer cho xuất kho thủ công"""
    ingredient_name = serializers.CharField(max_length=200, help_text="Tên nguyên liệu cần xuất")
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, help_text="Số lượng xuất")
    reason = serializers.ChoiceField(
        choices=StockOut.REASON_CHOICES,
        help_text="Reason for stock-out"
    )
    notes = serializers.CharField(required=False, allow_blank=True, help_text="Additional notes")
    
    class Meta:
        model = StockOut
        fields = ['ingredient_name', 'quantity', 'reason', 'notes']
        
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number of stock-out must be greater than 0")
        return value
        
    def validate_ingredient_name(self, value):
        try:
            ingredient = Ingredient.objects.get(name=value, deleted_at__isnull=True)
        except Ingredient.DoesNotExist:
            raise serializers.ValidationError(f"Ingredient '{value}' does not exist in inventory")
        return value


class StockOutSerializer(serializers.ModelSerializer):
    """Serializer cho hiển thị lịch sử xuất kho"""
    ingredient = IngredientSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    order_item_info = serializers.SerializerMethodField()
    
    class Meta:
        model = StockOut
        fields = ['id', 'ingredient', 'quantity', 'reason', 'user', 'order_item_info', 'notes', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_order_item_info(self, obj):
        """Thông tin order item nếu có"""
        if obj.order_item:
            return {
                'order_id': obj.order_item.order.id if obj.order_item.order else None,
                'menu_item': obj.order_item.menu_item.name if obj.order_item.menu_item else None,
                'quantity': obj.order_item.quantity,
                'table': obj.order_item.order.table.name if obj.order_item.order and obj.order_item.order.table else None
            }
        return None