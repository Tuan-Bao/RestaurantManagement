from rest_framework import serializers
from django.db import models
from .models import Table

class TableSerializer(serializers.ModelSerializer):
    current_orders_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Table
        fields = ['id', 'name', 'floor', 'status', 'current_orders_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_orders_count(self, obj):
        """Get count of current unpaid orders"""
        return obj.current_orders.count()

class TableCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['name', 'floor', 'status']
        
    def validate_name(self, value):
        """Validate table name"""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Table name is required")
        
        # Check unique name (chỉ trong các bàn chưa bị xóa)
        if Table.objects.filter(name=value.strip(), deleted_at__isnull=True).exists():
            raise serializers.ValidationError("Table name already exists")
        
        return value.strip()

class TableUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['name', 'floor', 'status']
        
    def validate_name(self, value):
        """Validate table name when updating"""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Table name is required")
        
        # Check unique name (exclude current table)
        instance = getattr(self, 'instance', None)
        if Table.objects.filter(name=value.strip(), deleted_at__isnull=True).exclude(
            id=instance.id if instance else None
        ).exists():
            raise serializers.ValidationError("Table name already exists")
        
        return value.strip()

class TableStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['status']
        
    def validate_status(self, value):
        """Validate status change"""
        if value not in ['available', 'unavailable']:
            raise serializers.ValidationError("Status must be 'available' or 'unavailable'")
        return value


class TableChangeSerializer(serializers.Serializer):
    """Serializer for changing table for an order"""
    from_table_id = serializers.IntegerField(required=True)
    to_table_id = serializers.IntegerField(required=True)
    
    def validate_from_table_id(self, value):
        """Validate from table exists and has orders"""
        try:
            table = Table.objects.get(id=value, deleted_at__isnull=True)
            
            # Check if table has unpaid orders
            if table.status != 'unavailable':
                raise serializers.ValidationError("From table must be 'unavailable' (have active orders)")
            
            return value
        except Table.DoesNotExist:
            raise serializers.ValidationError("From table does not exist")
    
    def validate_to_table_id(self, value):
        """Validate to table exists and is available"""
        try:
            table = Table.objects.get(id=value, deleted_at__isnull=True)
            if table.status != 'available':
                raise serializers.ValidationError(f"Destination table must be 'available' (current: {table.status})")
            
            # Double check: ensure destination table has no unpaid orders
            if table.current_orders.exists():
                raise serializers.ValidationError("Destination table already has unpaid orders")
            
            return value
        except Table.DoesNotExist:
            raise serializers.ValidationError("Destination table does not exist")
    
    def validate(self, data):
        """Cross-field validation"""
        from_table_id = data.get('from_table_id')
        to_table_id = data.get('to_table_id')
        
        if from_table_id == to_table_id:
            raise serializers.ValidationError("From table and to table cannot be the same")
        
        # Validate that from table has orders to move
        from django.apps import apps
        Order = apps.get_model('orders', 'Order')
        
        from_table_orders = Order.objects.filter(
            table_id=from_table_id, 
            status='unpaid'
        )
        
        if not from_table_orders.exists():
            raise serializers.ValidationError("From table has no unpaid orders to move")
        
        return data