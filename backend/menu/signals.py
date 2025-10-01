from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from inventory.models import Ingredient
from .models import MenuItem, Recipe


@receiver(post_save, sender=Ingredient)
def update_menu_item_status_on_ingredient_change(sender, instance, **kwargs):
    """
    Tự động cập nhật trạng thái MenuItem khi Ingredient thay đổi
    - Kiểm tra status: Nếu có ingredient 'inactive' → MenuItem = 'unavailable'
    - Kiểm tra quantity: Nếu không đủ nguyên liệu để làm món → MenuItem = 'unavailable'
    - Chỉ khi TẤT CẢ ingredients đều 'active' VÀ đủ số lượng → MenuItem = 'available'
    """
    # Tìm tất cả MenuItem có chứa ingredient này trong recipe
    menu_items_with_ingredient = MenuItem.objects.filter(
        recipes__ingredient=instance,
        deleted_at__isnull=True
    ).distinct()
    
    if not menu_items_with_ingredient.exists():
        print(f"🔍 No menu items found using ingredient: {instance.name}")
        return
    
    print(f"🍽️ Found {menu_items_with_ingredient.count()} menu items using ingredient: {instance.name}")
    
    with transaction.atomic():
        for menu_item in menu_items_with_ingredient:
            old_status = menu_item.status
            new_status = _calculate_menu_item_status(menu_item)
            
            if old_status != new_status:
                menu_item.status = new_status
                menu_item.save()
                
                print(f"✅ Updated {menu_item.name}: {old_status} → {new_status}")
            else:
                print(f"📌 {menu_item.name}: Status unchanged ({old_status})")


def _calculate_menu_item_status(menu_item):
    """
    Tính toán trạng thái MenuItem dựa trên:
    1. Trạng thái của tất cả ingredients (active/inactive)
    2. Số lượng tồn kho có đủ để làm món hay không
    
    Logic:
    - Nếu có BẤT KỲ ingredient nào 'inactive' → MenuItem = 'unavailable'
    - Nếu có BẤT KỲ ingredient nào không đủ số lượng → MenuItem = 'unavailable'  
    - Nếu TẤT CẢ ingredients đều 'active' VÀ đủ số lượng → MenuItem = 'available'
    """
    # Lấy tất cả recipes của menu item này
    recipes = Recipe.objects.filter(
        menu_item=menu_item,
        deleted_at__isnull=True
    ).select_related('ingredient')
    
    if not recipes.exists():
        print(f"⚠️  No recipes found for {menu_item.name} - keeping current status")
        return menu_item.status
    
    inactive_ingredients = []
    insufficient_ingredients = []
    available_ingredients = []
    
    for recipe in recipes:
        if not recipe.ingredient:
            continue
            
        ingredient = recipe.ingredient
        required_quantity = recipe.quantity_required or 0
        current_stock = ingredient.stock_quantity or 0
        
        # Kiểm tra trạng thái ingredient
        if ingredient.status == 'inactive' or ingredient.deleted_at:
            inactive_ingredients.append({
                'name': ingredient.name,
                'status': ingredient.status,
                'deleted': bool(ingredient.deleted_at)
            })
            continue
        
        # Kiểm tra số lượng tồn kho
        if current_stock < required_quantity:
            insufficient_ingredients.append({
                'name': ingredient.name,
                'required': float(required_quantity),
                'current_stock': float(current_stock),
                'shortage': float(required_quantity - current_stock)
            })
        else:
            available_ingredients.append({
                'name': ingredient.name,
                'required': float(required_quantity),
                'current_stock': float(current_stock),
                'excess': float(current_stock - required_quantity)
            })
    
    # Log chi tiết
    total_ingredients = len(inactive_ingredients) + len(insufficient_ingredients) + len(available_ingredients)
    print(f"📊 {menu_item.name} ingredients analysis:")
    print(f"   - Total ingredients: {total_ingredients}")
    print(f"   - Available & sufficient: {len(available_ingredients)}")
    print(f"   - Inactive: {len(inactive_ingredients)}")
    print(f"   - Insufficient quantity: {len(insufficient_ingredients)}")
    
    # Kiểm tra từng trường hợp
    if inactive_ingredients:
        print(f"   ❌ Inactive ingredients:")
        for ing in inactive_ingredients:
            status_info = "deleted" if ing['deleted'] else f"status={ing['status']}"
            print(f"      • {ing['name']} ({status_info})")
        return 'unavailable'
    
    if insufficient_ingredients:
        print(f"   ❌ Insufficient ingredients:")
        for ing in insufficient_ingredients:
            print(f"      • {ing['name']}: need {ing['required']}, have {ing['current_stock']} (short {ing['shortage']})")
        return 'unavailable'
    
    print(f"   ✅ All ingredients available & sufficient:")
    for ing in available_ingredients:
        print(f"      • {ing['name']}: need {ing['required']}, have {ing['current_stock']} (+{ing['excess']})")
    
    return 'available'


# Utility function để check trạng thái menu item thủ công
def check_menu_item_availability(menu_item_id):
    """
    Function tiện ích để kiểm tra trạng thái của một menu item cụ thể
    """
    try:
        menu_item = MenuItem.objects.get(id=menu_item_id, deleted_at__isnull=True)
        current_status = menu_item.status
        calculated_status = _calculate_menu_item_status(menu_item)
        
        # Chi tiết các ingredient requirements
        recipes = Recipe.objects.filter(
            menu_item=menu_item,
            deleted_at__isnull=True
        ).select_related('ingredient')
        
        ingredients_info = []
        for recipe in recipes:
            if recipe.ingredient:
                ingredients_info.append({
                    'name': recipe.ingredient.name,
                    'required': float(recipe.quantity_required or 0),
                    'current_stock': float(recipe.ingredient.stock_quantity or 0),
                    'status': recipe.ingredient.status,
                    'is_sufficient': (recipe.ingredient.stock_quantity or 0) >= (recipe.quantity_required or 0)
                })
        
        return {
            'menu_item': menu_item.name,
            'current_status': current_status,
            'calculated_status': calculated_status,
            'needs_update': current_status != calculated_status,
            'ingredients': ingredients_info
        }
    except MenuItem.DoesNotExist:
        return {'error': f'MenuItem with id {menu_item_id} not found'}


# Utility function để cập nhật trạng thái tất cả menu items
def update_all_menu_items_status():
    """
    Function tiện ích để cập nhật trạng thái tất cả menu items dựa trên ingredients
    """
    menu_items = MenuItem.objects.filter(deleted_at__isnull=True)
    updated_count = 0
    
    print(f"🔄 Checking status for {menu_items.count()} menu items...")
    
    with transaction.atomic():
        for menu_item in menu_items:
            old_status = menu_item.status
            new_status = _calculate_menu_item_status(menu_item)
            
            if old_status != new_status:
                menu_item.status = new_status
                menu_item.save()
                updated_count += 1
                print(f"✅ Updated {menu_item.name}: {old_status} → {new_status}")
    
    print(f"🎉 Updated {updated_count} menu items out of {menu_items.count()}")
    return updated_count