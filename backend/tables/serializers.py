from rest_framework import serializers
from .models import Table

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'floor', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']