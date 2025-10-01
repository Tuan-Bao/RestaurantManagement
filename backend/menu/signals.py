from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from inventory.models import Ingredient
from .models import MenuItem, Recipe


@receiver(post_save, sender=Ingredient)
def update_menu_item_status_on_ingredient_change(sender, instance, **kwargs):
    """
    Tự động cập nhật trạng thái MenuItem khi Ingredient thay đổi trạng thái
    - Nếu ingredient chuyển sang 'inactive' → MenuItem chuyển sang 'unavailable'
    - Nếu ingredient chuyển sang 'active' và TẤT CẢ ingredients khác đều active → MenuItem chuyển sang 'available'
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
    Tính toán trạng thái MenuItem dựa trên trạng thái của tất cả ingredients trong recipe
    
    Logic:
    - Nếu có BẤT KỲ ingredient nào 'inactive' → MenuItem = 'unavailable'
    - Nếu TẤT CẢ ingredients đều 'active' → MenuItem = 'available'
    - Nếu không có recipe → MenuItem giữ nguyên trạng thái hiện tại
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
    active_ingredients = []
    
    for recipe in recipes:
        if recipe.ingredient:
            if recipe.ingredient.status == 'inactive' or recipe.ingredient.deleted_at:
                inactive_ingredients.append(recipe.ingredient.name)
            elif recipe.ingredient.status == 'active':
                active_ingredients.append(recipe.ingredient.name)
    
    # Log chi tiết ingredients
    total_ingredients = len(inactive_ingredients) + len(active_ingredients)
    print(f"📊 {menu_item.name} ingredients status:")
    print(f"   - Active: {len(active_ingredients)}/{total_ingredients}")
    print(f"   - Inactive: {len(inactive_ingredients)}/{total_ingredients}")
    
    if inactive_ingredients:
        print(f"   - Inactive ingredients: {', '.join(inactive_ingredients)}")
        return 'unavailable'
    else:
        print(f"   - All ingredients are active")
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
        
        return {
            'menu_item': menu_item.name,
            'current_status': current_status,
            'calculated_status': calculated_status,
            'needs_update': current_status != calculated_status
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