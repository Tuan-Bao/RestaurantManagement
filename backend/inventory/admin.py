from django.contrib import admin
from .models import Ingredient

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ['name', 'unit', 'created_at', 'updated_at']
    search_fields = ['name']
    list_filter = ['unit']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
