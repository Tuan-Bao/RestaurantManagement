from django.contrib import admin
from .models import Table

@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['name', 'floor', 'status', 'created_at']
    list_filter = ['status', 'floor']
    search_fields = ['name']
    ordering = ['floor', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'floor', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
