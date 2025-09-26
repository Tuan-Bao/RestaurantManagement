from rest_framework import serializers
from .models import Table

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'floor', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

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