from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import TableMerge


@receiver(post_save, sender='orders.Order')
def auto_separate_tables_on_payment(sender, instance, **kwargs):
    """
    Tự động tách bàn khi order chung được thanh toán (status = 'paid')
    Khi ghép bàn → chỉ có 1 order chung cho tất cả bàn
    """
    # Chỉ xử lý khi order được thanh toán
    if instance.status != 'paid':
        return
    
    # Kiểm tra xem bàn của order có đang trong merge không
    if not instance.table:
        return
    
    # Tìm active merge có chứa bàn này (main_table hoặc merged_tables)
    active_merges = TableMerge.objects.filter(
        is_active=True
    ).filter(
        models.Q(main_table=instance.table) |
        models.Q(merged_tables=instance.table)
    ).distinct()
    
    for merge in active_merges:
        # Vì chỉ có 1 order chung cho tất cả bàn đã ghép
        # Nên khi order này được thanh toán → tự động tách bàn ngay
        
        # Tách bàn tự động
        merge.separated_at = timezone.now()
        merge.separated_by = None  # System auto-separate
        merge.is_active = False
        merge.save()
        
        # Reset trạng thái các bàn đã ghép về 'available'
        merge.merged_tables.update(status='available')
        
        # Log để theo dõi
        print(f"Auto-separated table merge {merge.id}: {merge.main_table.name} after order {instance.id} payment completed")
        print(f"Restored tables to available: {[t.name for t in merge.merged_tables.all()]}")


# Import để đảm bảo models có thể import
from django.db import models