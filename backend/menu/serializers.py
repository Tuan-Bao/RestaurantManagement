from rest_framework import serializers
from .models import Category, MenuItem, Recipe
import cloudinary
import cloudinary.uploader
import os
from django.conf import settings
from decouple import config

# Configure cloudinary
cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME'),
    api_key=config('CLOUDINARY_API_KEY'),
    api_secret=config('CLOUDINARY_API_SECRET')
)

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'category', 'category_name', 'name', 'description', 'price', 'image_url', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CategoryDetailSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'menu_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class MenuItemCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = MenuItem
        fields = ['category', 'name', 'description', 'price', 'status', 'image']
        
    def create(self, validated_data):
        image_file = validated_data.pop('image', None)
        menu_item = MenuItem.objects.create(**validated_data)
        
        if image_file:
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder="menu_items/",
                public_id=f"menu_item_{menu_item.id}",
                overwrite=True
            )
            menu_item.image_url = upload_result['secure_url']
            menu_item.save()
        
        return menu_item

class MenuItemUpdateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = MenuItem
        fields = ['category', 'name', 'description', 'price', 'status', 'image']
        
    def update(self, instance, validated_data):
        image_file = validated_data.pop('image', None)
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if image_file:
            # Upload new image to Cloudinary
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder="menu_items/",
                public_id=f"menu_item_{instance.id}",
                overwrite=True
            )
            instance.image_url = upload_result['secure_url']
        
        instance.save()
        return instance

class MenuItemStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['status']
        
    def validate_status(self, value):
        if value not in ['available', 'unavailable']:
            raise serializers.ValidationError("Status must be 'available' or 'unavailable'")
        return value

class RecipeSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)
    
    class Meta:
        model = Recipe
        fields = ['id', 'ingredient', 'ingredient_name', 'ingredient_unit', 'quantity_required', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['ingredient', 'quantity_required']