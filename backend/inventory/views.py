from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from .models import Ingredient
from .serializers import IngredientSerializer
from accounts.permissions import IsAdminUser

class IngredientListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/inventory/ingredients/?name=... - Danh sách nguyên liệu (query theo tên)
    POST /api/inventory/ingredients/           - Tạo mới nguyên liệu (Admin only)
    """
    serializer_class = IngredientSerializer
    
    def get_queryset(self):
        queryset = Ingredient.objects.filter(deleted_at__isnull=True)
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset.order_by('id')
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'total': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            ingredient = serializer.save()
            return Response({
                'success': True,
                'message': 'Created ingredient successfully',
                'data': IngredientSerializer(ingredient).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Created ingredient failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class IngredientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/inventory/ingredients/{id}/    - Chi tiết nguyên liệu
    PATCH  /api/inventory/ingredients/{id}/    - Cập nhật nguyên liệu (Admin only)
    DELETE /api/inventory/ingredients/{id}/    - Xóa nguyên liệu (Admin only)
    """
    serializer_class = IngredientSerializer
    
    def get_queryset(self):
        return Ingredient.objects.filter(deleted_at__isnull=True)
    
    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        ingredient = self.get_object()
        serializer = self.get_serializer(ingredient)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        ingredient = self.get_object()
        serializer = self.get_serializer(ingredient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated ingredient successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'Updated ingredient failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        ingredient = self.get_object()
        ingredient.deleted_at = ingredient.deleted_at or ingredient.updated_at
        ingredient.save()
        return Response({
            'success': True,
            'message': 'Deleted ingredient successfully'
        }, status=status.HTTP_204_NO_CONTENT)
