from rest_framework import serializers
from django.db import models
from .models import Table, TableMerge

class TableSerializer(serializers.ModelSerializer):
    current_orders_count = serializers.SerializerMethodField()
    is_mergeable = serializers.SerializerMethodField()
    
    class Meta:
        model = Table
        fields = ['id', 'name', 'floor', 'status', 'current_orders_count', 'is_mergeable', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_orders_count(self, obj):
        """Get count of current unpaid orders"""
        return obj.current_orders.count()
    
    def get_is_mergeable(self, obj):
        """Check if table can be merged"""
        return obj.is_available_for_merge

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


class TableMergeSerializer(serializers.ModelSerializer):
    main_table = TableSerializer(read_only=True)
    merged_tables = TableSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    separated_by_name = serializers.CharField(source='separated_by.name', read_only=True)
    
    class Meta:
        model = TableMerge
        fields = ['id', 'main_table', 'merged_tables', 'created_by_name', 'separated_by_name', 
                 'total_tables_count', 'is_active', 'created_at', 'separated_at']
        read_only_fields = ['id', 'created_at']


class TableMergeCreateSerializer(serializers.Serializer):
    """Serializer for creating table merge"""
    main_table_id = serializers.IntegerField(required=True)
    merged_table_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        min_length=1, 
        max_length=10,
        help_text="List of table IDs to merge into main table"
    )
    
    def validate_main_table_id(self, value):
        """Validate main table exists and is available"""
        try:
            table = Table.objects.get(id=value, deleted_at__isnull=True)
            if table.status != 'available':
                raise serializers.ValidationError("Main table must be available for merging")
            return value
        except Table.DoesNotExist:
            raise serializers.ValidationError("Main table does not exist")
    
    def validate_merged_table_ids(self, value):
        """Validate merged tables exist and are available"""
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Duplicate table IDs are not allowed")
        
        tables = Table.objects.filter(id__in=value, deleted_at__isnull=True)
        if tables.count() != len(value):
            raise serializers.ValidationError("Some tables do not exist")
        
        # Check if all tables are available (must be available status)
        unavailable_tables = []
        for table in tables:
            if table.status != 'available':
                unavailable_tables.append(f"{table.name}({table.status})")
        
        if unavailable_tables:
            raise serializers.ValidationError(
                f"All tables must be 'available' for merging. Unavailable: {', '.join(unavailable_tables)}"
            )
        
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        main_table_id = data.get('main_table_id')
        merged_table_ids = data.get('merged_table_ids', [])
        
        # Main table cannot be in merged tables list
        if main_table_id in merged_table_ids:
            raise serializers.ValidationError("Main table cannot be in the merged tables list")
        
        # Check if any table is already merged
        all_table_ids = [main_table_id] + merged_table_ids
        active_merges = TableMerge.objects.filter(
            is_active=True
        ).filter(
            models.Q(main_table_id__in=all_table_ids) |
            models.Q(merged_tables__id__in=all_table_ids)
        ).distinct()
        
        if active_merges.exists():
            raise serializers.ValidationError("Some tables are already part of an active merge")
        
        return data


class TableChangeSerializer(serializers.Serializer):
    """Serializer for changing table for an order"""
    from_table_id = serializers.IntegerField(required=True)
    to_table_id = serializers.IntegerField(required=True)
    order_id = serializers.IntegerField(required=False, allow_null=True,
                                       help_text="Specific order ID to move, if not provided, all unpaid orders will be moved")
    
    def validate_from_table_id(self, value):
        """Validate from table exists"""
        try:
            Table.objects.get(id=value, deleted_at__isnull=True)
            return value
        except Table.DoesNotExist:
            raise serializers.ValidationError("From table does not exist")
    
    def validate_to_table_id(self, value):
        """Validate to table exists and is available"""
        try:
            table = Table.objects.get(id=value, deleted_at__isnull=True)
            if table.status != 'available':
                raise serializers.ValidationError(f"Destination table must be 'available' (current: {table.status})")
            
            # Check if destination table has any unpaid orders
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
        
        # If specific order_id is provided, validate it belongs to from_table
        order_id = data.get('order_id')
        if order_id:
            if not from_table_orders.filter(id=order_id).exists():
                raise serializers.ValidationError("Order does not belong to the from table or is already paid")
        
        return data