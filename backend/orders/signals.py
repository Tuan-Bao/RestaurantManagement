from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from decimal import Decimal
from .models import OrderItem
from inventory.models import StockOut, Ingredient
from menu.models import Recipe


@receiver(pre_save, sender=OrderItem)
def check_ingredient_availability(sender, instance, **kwargs):
    """
    Kiểm tra tồn kho trước khi chuyển order item sang cooking
    """
    # Chỉ kiểm tra khi chuyển sang cooking
    if instance.status == 'cooking':
        # Lấy instance cũ để so sánh
        if instance.pk:
            try:
                old_instance = OrderItem.objects.get(pk=instance.pk)
                # Chỉ kiểm tra khi status thay đổi từ trạng thái khác sang cooking
                if old_instance.status != 'cooking':
                    _validate_ingredients_availability(instance)
            except OrderItem.DoesNotExist:
                # Nếu là tạo mới với status cooking
                _validate_ingredients_availability(instance)
        else:
            # Nếu là tạo mới với status cooking
            _validate_ingredients_availability(instance)


@receiver(post_save, sender=OrderItem)
def auto_create_stock_out(sender, instance, created, **kwargs):
    """
    Tự động tạo stock-out khi order item chuyển sang cooking
    """
    # Chỉ xử lý khi status là cooking
    if instance.status == 'cooking':
        # Nếu là tạo mới hoặc cập nhật
        if created:
            # Nếu tạo mới với status cooking ngay
            _create_stock_out_for_order_item(instance)
        else:
            # Kiểm tra xem có phải vừa chuyển sang cooking không
            try:
                # Lấy lại từ database để đảm bảo dữ liệu mới nhất
                current_item = OrderItem.objects.get(pk=instance.pk)
                if current_item.status == 'cooking':
                    # Kiểm tra xem đã tạo stock-out cho order item này chưa
                    existing_stock_outs = StockOut.objects.filter(
                        order_item=instance,
                        reason='cooking'
                    )
                    
                    if not existing_stock_outs.exists():
                        _create_stock_out_for_order_item(instance)
            except OrderItem.DoesNotExist:
                pass


def _validate_ingredients_availability(order_item):
    """
    Kiểm tra tính sẵn có của nguyên liệu trước khi nấu
    """
    if not order_item.menu_item:
        return
    
    # Lấy công thức cho món ăn
    recipes = Recipe.objects.filter(
        menu_item=order_item.menu_item,
        deleted_at__isnull=True
    ).select_related('ingredient')
    
    insufficient_ingredients = []
    
    for recipe in recipes:
        if recipe.ingredient and recipe.quantity_required:
            required_quantity = recipe.quantity_required * (order_item.quantity or 1)
            current_stock = recipe.ingredient.stock_quantity or 0
            
            if current_stock < required_quantity:
                insufficient_ingredients.append({
                    'ingredient': recipe.ingredient.name,
                    'required': required_quantity,
                    'available': current_stock,
                    'unit': recipe.ingredient.unit
                })
    
    if insufficient_ingredients:
        error_details = []
        for item in insufficient_ingredients:
            error_details.append(
                f"{item['ingredient']}: cần {item['required']} {item['unit']}, "
                f"chỉ có {item['available']} {item['unit']}"
            )
        
        raise ValueError(
            f"Không đủ nguyên liệu để nấu {order_item.menu_item.name}. "
            f"Chi tiết: {'; '.join(error_details)}"
        )


def _create_stock_out_for_order_item(order_item):
    """
    Tạo stock-out cho tất cả nguyên liệu cần thiết của order item
    """
    if not order_item.menu_item:
        return
    
    # Lấy công thức cho món ăn
    recipes = Recipe.objects.filter(
        menu_item=order_item.menu_item,
        deleted_at__isnull=True
    ).select_related('ingredient')
    
    with transaction.atomic():
        stock_outs_created = []
        
        for recipe in recipes:
            if recipe.ingredient and recipe.quantity_required:
                # Tính số lượng cần xuất = số lượng trong công thức * số lượng order
                quantity_to_stock_out = recipe.quantity_required * (order_item.quantity or 1)
                
                # Kiểm tra tồn kho
                ingredient = recipe.ingredient
                current_stock = ingredient.stock_quantity or 0
                
                if current_stock >= quantity_to_stock_out:
                    # Cập nhật tồn kho
                    ingredient.stock_quantity = current_stock - quantity_to_stock_out
                    
                    # Tự động cập nhật status dựa trên quantity
                    if ingredient.stock_quantity > 0:
                        ingredient.status = 'active'
                    elif ingredient.stock_quantity == 0:
                        ingredient.status = 'inactive'
                    
                    ingredient.save()
                    
                    # Tạo stock-out record
                    stock_out = StockOut.objects.create(
                        ingredient=ingredient,
                        quantity=quantity_to_stock_out,
                        reason='cooking',
                        order_item=order_item,  # Liên kết với order item
                        user=order_item.order.user if order_item.order else None,
                        notes=f"Auto stock-out for {order_item.menu_item.name} (Order #{order_item.order.id if order_item.order else 'N/A'})"
                    )
                    
                    stock_outs_created.append(stock_out)
                else:
                    # Không đủ hàng - rollback transaction
                    raise ValueError(
                        f"Không đủ {ingredient.name} để nấu {order_item.menu_item.name}. "
                        f"Cần: {quantity_to_stock_out} {ingredient.unit}, "
                        f"Có: {current_stock} {ingredient.unit}"
                    )
        
        return stock_outs_created


# Utility function để cancel stock-out khi order item bị hủy hoặc thay đổi
@receiver(pre_save, sender=OrderItem)
def handle_order_item_status_change(sender, instance, **kwargs):
    """
    Xử lý khi status của order item thay đổi từ cooking sang trạng thái khác
    """
    if instance.pk:
        try:
            old_instance = OrderItem.objects.get(pk=instance.pk)
            
            # Nếu thay đổi từ cooking sang cancelled, cần hoàn lại nguyên liệu
            if old_instance.status == 'cooking' and instance.status == 'cancelled':
                _reverse_stock_out_for_order_item(instance)
                
        except OrderItem.DoesNotExist:
            pass


def _reverse_stock_out_for_order_item(order_item):
    """
    Hoàn lại nguyên liệu khi order item bị hủy từ trạng thái cooking
    """
    # Tìm tất cả stock-out liên quan đến order item này
    stock_outs = StockOut.objects.filter(
        order_item=order_item,
        reason='cooking'
    )
    
    with transaction.atomic():
        for stock_out in stock_outs:
            # Hoàn lại số lượng vào kho
            ingredient = stock_out.ingredient
            ingredient.stock_quantity = (ingredient.stock_quantity or 0) + stock_out.quantity
            
            # Tự động cập nhật status dựa trên quantity
            if ingredient.stock_quantity > 0:
                ingredient.status = 'active'
            elif ingredient.stock_quantity == 0:
                ingredient.status = 'inactive'
            
            ingredient.save()
            
            # Đánh dấu stock-out là đã reverse (có thể thêm field reversed=True)
            # Hoặc tạo stock-in entry tương ứng
            # Ở đây ta sẽ xóa stock-out record
            stock_out.delete()