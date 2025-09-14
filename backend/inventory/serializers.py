from rest_framework import serializers
from .models import Ingredient, Storage, StockIn, StockOut, Recipe
from menu.serializers import MenuItemSerializer

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class StorageSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Storage
        fields = ['id', 'ingredient', 'ingredient_id', 'stock_quantity', 'min_quantity', 'is_low_stock', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class StockInSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = StockIn
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity', 'price', 'user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class StockOutSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = StockOut
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity', 'reason', 'user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class RecipeSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Recipe
        fields = ['id', 'menu_item', 'menu_item_id', 'ingredient', 'ingredient_id', 'quantity_required', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']