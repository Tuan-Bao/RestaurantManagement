from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView

from .models import Category, MenuItem, Recipe
from .serializers import (
    CategorySerializer, CategoryDetailSerializer,
    MenuItemSerializer, MenuItemCreateSerializer, MenuItemUpdateSerializer, MenuItemStatusSerializer,
    RecipeSerializer, RecipeCreateUpdateSerializer
)
from accounts.permissions import IsAdminUser

# ===== CATEGORY VIEWS =====
class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/menu/categories/?name=... - Danh sách danh mục
    POST /api/menu/categories/          - Tạo danh mục mới (Admin only)
    """
    def get_queryset(self):
        queryset = Category.objects.filter(deleted_at__isnull=True)
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset.order_by('id')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategorySerializer
        return CategorySerializer
    
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
            category = serializer.save()
            return Response({
                'success': True,
                'message': 'Created category successfully',
                'data': CategorySerializer(category).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Created category failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/menu/categories/{id}/ - Chi tiết danh mục + menu items
    PATCH  /api/menu/categories/{id}/ - Cập nhật danh mục (Admin only)
    DELETE /api/menu/categories/{id}/ - Xóa danh mục (Admin only)
    """
    def get_queryset(self):
        return Category.objects.filter(deleted_at__isnull=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CategoryDetailSerializer  # Bao gồm menu_items
        return CategorySerializer
    
    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        category = self.get_object()
        serializer = self.get_serializer(category)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        category = self.get_object()
        serializer = self.get_serializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated category successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'Updated category failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        
        # Check if category has menu items
        if category.menu_items.filter(deleted_at__isnull=True).exists():
            return Response({
                'success': False,
                'message': 'Cannot delete category that has menu items'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Soft delete
        category.deleted_at = timezone.now()
        category.save()
        
        return Response({
            'success': True,
            'message': 'Deleted category successfully'
        }, status=status.HTTP_204_NO_CONTENT)

# ===== MENUITEM VIEWS =====
class MenuItemListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/menu/items/?name=...&category_id=...&status=... - Danh sách món ăn
    POST /api/menu/items/                                  - Tạo món ăn mới (Admin only)
    """
    def get_queryset(self):
        queryset = MenuItem.objects.filter(deleted_at__isnull=True)
        
        # Filter by name
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        # Filter by category
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('id')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MenuItemCreateSerializer
        return MenuItemSerializer
    
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
            menu_item = serializer.save()
            return Response({
                'success': True,
                'message': 'Created menu item successfully',
                'data': MenuItemSerializer(menu_item).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Created menu item failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/menu/items/{id}/ - Chi tiết món ăn
    PATCH  /api/menu/items/{id}/ - Cập nhật món ăn (Admin only)
    DELETE /api/menu/items/{id}/ - Xóa món ăn (Admin only)
    """
    def get_queryset(self):
        return MenuItem.objects.filter(deleted_at__isnull=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return MenuItemSerializer
        return MenuItemUpdateSerializer
    
    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        menu_item = self.get_object()
        serializer = self.get_serializer(menu_item)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        menu_item = self.get_object()
        serializer = self.get_serializer(menu_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated menu item successfully',
                'data': MenuItemSerializer(menu_item).data
            })
        return Response({
            'success': False,
            'message': 'Updated menu item failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        menu_item = self.get_object()
        
        # Soft delete
        menu_item.deleted_at = timezone.now()
        menu_item.save()
        
        return Response({
            'success': True,
            'message': 'Deleted menu item successfully'
        }, status=status.HTTP_204_NO_CONTENT)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])  # Staff + Admin có thể thay đổi status
def menu_item_status_view(request, pk):
    """
    PATCH /api/menu/items/{id}/status/ - Thay đổi trạng thái món ăn (Staff + Admin)
    """
    try:
        menu_item = MenuItem.objects.get(pk=pk, deleted_at__isnull=True)
    except MenuItem.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Menu item not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = MenuItemStatusSerializer(menu_item, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': f'Menu item status changed to {menu_item.status}',
            'data': MenuItemSerializer(menu_item).data
        })
    
    return Response({
        'success': False,
        'message': 'Status change failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

# ===== RECIPE VIEWS =====
class RecipeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/menu/items/{menu_id}/recipes/ - Danh sách nguyên liệu của món
    POST /api/menu/items/{menu_id}/recipes/ - Thêm nhiều nguyên liệu vào món (Admin only, nhận mảng)
    """
    serializer_class = RecipeSerializer
    
    def get_queryset(self):
        menu_id = self.kwargs.get('menu_id')
        return Recipe.objects.filter(menu_item_id=menu_id, deleted_at__isnull=True)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecipeCreateUpdateSerializer
        return RecipeSerializer
    
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
        menu_id = self.kwargs.get('menu_id')
        try:
            menu_item = MenuItem.objects.get(pk=menu_id, deleted_at__isnull=True)
        except MenuItem.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Menu item not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data
        if isinstance(data, list):
            recipes = []
            errors = []
            for item in data:
                serializer = RecipeCreateUpdateSerializer(data=item)
                if serializer.is_valid():
                    recipe = serializer.save(menu_item=menu_item)
                    recipes.append(RecipeSerializer(recipe).data)
                else:
                    errors.append(serializer.errors)
            if recipes:
                return Response({
                    'success': True,
                    'message': 'Added ingredients to recipe successfully',
                    'data': recipes,
                    'errors': errors if errors else None
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to add ingredients',
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = RecipeCreateUpdateSerializer(data=data)
            if serializer.is_valid():
                recipe = serializer.save(menu_item=menu_item)
                return Response({
                    'success': True,
                    'message': 'Added ingredient to recipe successfully',
                    'data': RecipeSerializer(recipe).data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'message': 'Failed to add ingredient to recipe',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    PATCH  /api/menu/recipes/{id}/ - Cập nhật số lượng nguyên liệu (Admin only)
    DELETE /api/menu/recipes/{id}/ - Xóa nguyên liệu khỏi món (Admin only)
    """
    queryset = Recipe.objects.filter(deleted_at__isnull=True)
    
    def get_serializer_class(self):
        return RecipeCreateUpdateSerializer
    
    def get_permissions(self):
        return [IsAuthenticated(), IsAdminUser()]
    
    def update(self, request, *args, **kwargs):
        recipe = self.get_object()
        serializer = self.get_serializer(recipe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated recipe successfully',
                'data': RecipeSerializer(recipe).data
            })
        return Response({
            'success': False,
            'message': 'Updated recipe failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        recipe = self.get_object()
        
        # Soft delete
        recipe.deleted_at = timezone.now()
        recipe.save()
        
        return Response({
            'success': True,
            'message': 'Removed ingredient from recipe successfully'
        }, status=status.HTTP_204_NO_CONTENT)

class RecipeBulkUpdateView(APIView):
    """
    PATCH /api/menu/items/{menu_id}/recipes/ - Cập nhật công thức theo mảng ingredient
    Body: [ {"ingredient": id, "quantity_required": value}, ... ]
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, menu_id):
        data = request.data
        if not isinstance(data, list):
            return Response({
                'success': False,
                'message': 'Body must be a list of ingredients',
                'errors': None
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            menu_item = MenuItem.objects.get(pk=menu_id, deleted_at__isnull=True)
        except MenuItem.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Menu item not found'
            }, status=status.HTTP_404_NOT_FOUND)
        # Build dict for quick lookup
        incoming = {int(item['ingredient']): item['quantity_required'] for item in data if 'ingredient' in item and 'quantity_required' in item}
        # Get all current recipes
        current_recipes = Recipe.objects.filter(menu_item=menu_item, deleted_at__isnull=True)
        current_ingredients = set(r.ingredient_id for r in current_recipes)
        incoming_ingredients = set(incoming.keys())
        updated = []
        added = []
        removed = []
        # Update or remove existing
        for recipe in current_recipes:
            if recipe.ingredient_id in incoming_ingredients:
                # Update quantity_required
                recipe.quantity_required = incoming[recipe.ingredient_id]
                recipe.save()
                updated.append(RecipeSerializer(recipe).data)
            else:
                # Remove ingredient not in incoming
                recipe.deleted_at = timezone.now()
                recipe.save()
                removed.append(recipe.ingredient_id)
        # Add new ingredients
        for ing_id in incoming_ingredients - current_ingredients:
            # recipe = Recipe.objects.create(
            #     menu_item=menu_item,
            #     ingredient_id=ing_id,
            #     quantity_required=incoming[ing_id]
            # )
            # added.append(RecipeSerializer(recipe).data)
             # Kiểm tra nếu đã từng có recipe bị xóa mềm
            old_recipe = Recipe.objects.filter(
                menu_item=menu_item,
                ingredient_id=ing_id,
                deleted_at__isnull=False
            ).first()
            if old_recipe:
                # Khôi phục lại và cập nhật số lượng
                old_recipe.deleted_at = None
                old_recipe.quantity_required = incoming[ing_id]
                old_recipe.save()
                added.append(RecipeSerializer(old_recipe).data)
            else:
                # Tạo mới nếu chưa từng có
                recipe = Recipe.objects.create(
                    menu_item=menu_item,
                    ingredient_id=ing_id,
                    quantity_required=incoming[ing_id]
                )
                added.append(RecipeSerializer(recipe).data)
        return Response({
            'success': True,
            'message': 'Bulk updated recipe',
            'updated': updated,
            'added': added,
            'removed': list(removed)
        })
