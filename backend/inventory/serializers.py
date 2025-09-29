from rest_framework import serializers
from .models import Ingredient, StockIn, StockOut
from menu.models import Recipe
from menu.serializers import MenuItemSerializer


class IngredientSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()
    total_value = serializers.ReadOnlyField()
    
    class Meta:
        model = Ingredient
        fields = [
            'id', 'name', 'unit', 'stock_quantity', 'min_quantity', 
            'price_per_unit', 'status', 'is_low_stock', 'total_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_low_stock', 'total_value', 'created_at', 'updated_at']


class IngredientCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating ingredients (excludes stock_quantity)"""
    
    class Meta:
        model = Ingredient
        fields = ['name', 'unit', 'min_quantity', 'price_per_unit', 'status']


class StockInSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True, required=True)
    price_per_unit = serializers.ReadOnlyField()
    
    class Meta:
        model = StockIn
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity', 'price', 'price_per_unit', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at', 'price_per_unit']
        
    def validate_quantity(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
        
    def validate_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value


class StockOutSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = StockOut
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity', 'reason', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
        
    def validate_quantity(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class RecipeSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Recipe
        fields = ['id', 'menu_item', 'menu_item_id', 'ingredient', 'ingredient_id', 'quantity_required', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']