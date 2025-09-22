from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework import serializers

from .models import Ingredient, StockIn, StockOut, Recipe
from menu.serializers import MenuItemSerializer  # giữ nguyên nếu bạn đã có

# =========================
# INGREDIENT
# =========================
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = [
            "id",
            "name",
            "unit",
            "stock_quantity",
            "min_quantity",
            "price_per_unit",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def validate(self, attrs):
        # đảm bảo không âm
        for f in ("stock_quantity", "min_quantity", "price_per_unit"):
            if f in attrs and attrs[f] is not None and Decimal(attrs[f]) < 0:
                raise serializers.ValidationError({f: "Giá trị không được âm."})
        return attrs


# =========================
# STOCK IN
# =========================
class StockInSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = StockIn
        fields = [
            "id",
            "ingredient",
            "ingredient_id",
            "quantity",
            "price",
            "user",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("quantity") is None or Decimal(attrs["quantity"]) <= 0:
            raise serializers.ValidationError({"quantity": "Số lượng nhập phải > 0."})
        if attrs.get("price") is None or Decimal(attrs["price"]) < 0:
            raise serializers.ValidationError({"price": "Giá không hợp lệ."})
        return attrs

    def create(self, validated_data):
        ingredient_id = validated_data.pop("ingredient_id")
        validated_data["ingredient"] = get_object_or_404(Ingredient, pk=ingredient_id)
        obj = super().create(validated_data)
        # cập nhật tồn kho sau khi lưu phiếu
        obj.apply_to_inventory()
        return obj


# =========================
# STOCK OUT
# =========================
class StockOutSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = StockOut
        fields = [
            "id",
            "ingredient",
            "ingredient_id",
            "quantity",
            "reason",
            "user",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("quantity") is None or Decimal(attrs["quantity"]) <= 0:
            raise serializers.ValidationError({"quantity": "Số lượng xuất phải > 0."})
        return attrs

    def create(self, validated_data):
        ingredient_id = validated_data.pop("ingredient_id")
        validated_data["ingredient"] = get_object_or_404(Ingredient, pk=ingredient_id)
        # kiểm tra tồn kho trước khi tạo phiếu
        ing = validated_data["ingredient"]
        qty = Decimal(validated_data["quantity"])
        if ing.stock_quantity < qty:
            raise serializers.ValidationError(
                {"quantity": f"Tồn kho '{ing.name}' không đủ. Hiện có {ing.stock_quantity}."}
            )
        obj = super().create(validated_data)
        obj.apply_to_inventory()
        return obj


# =========================
# RECIPE
# =========================
class RecipeSerializer(serializers.ModelSerializer):
    from menu.models import MenuItem  # tránh import vòng tròn
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)

    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Recipe
        fields = [
            "id",
            "menu_item",
            "menu_item_id",
            "ingredient",
            "ingredient_id",
            "quantity_required",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("quantity_required") is None or Decimal(attrs["quantity_required"]) <= 0:
            raise serializers.ValidationError({"quantity_required": "Định mức phải > 0."})
        return attrs

    def create(self, validated_data):
        # gán FK từ *_id
        menu_item_id = validated_data.pop("menu_item_id")
        ingredient_id = validated_data.pop("ingredient_id")
        from menu.models import MenuItem  # import tại chỗ để tránh circular
        validated_data["menu_item"] = get_object_or_404(MenuItem, pk=menu_item_id)
        validated_data["ingredient"] = get_object_or_404(Ingredient, pk=ingredient_id)
        return super().create(validated_data)
