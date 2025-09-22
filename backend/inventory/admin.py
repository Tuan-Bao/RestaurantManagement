from django.contrib import admin
from .models import Ingredient, StockIn, StockOut, Recipe


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("name", "unit", "stock_quantity", "min_quantity", "price_per_unit", "status", "is_active")
    list_filter = ("status", "unit", "is_active")
    search_fields = ("name",)


@admin.register(StockIn)
class StockInAdmin(admin.ModelAdmin):
    list_display = ("ingredient", "quantity", "price", "created_at", "user")
    list_filter = ("created_at",)
    search_fields = ("ingredient__name",)


@admin.register(StockOut)
class StockOutAdmin(admin.ModelAdmin):
    list_display = ("ingredient", "quantity", "reason", "created_at", "user")
    list_filter = ("reason", "created_at")
    search_fields = ("ingredient__name",)


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("menu_item", "ingredient", "quantity_required")
    search_fields = ("menu_item__name", "ingredient__name")
