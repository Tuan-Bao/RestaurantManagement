from django.db import models

class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
        ('merged', 'Merged'),  # Thêm status cho bàn đã ghép
    ]
    
    name = models.CharField(max_length=100, null=True, blank=True)
    floor = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Table {self.name} - Floor {self.floor}"

    @property
    def is_available_for_merge(self):
        """Check if table can be merged (available or has unpaid orders)"""
        return self.status in ['available', 'unavailable'] and not self.deleted_at
    
    @property
    def current_orders(self):
        """Get current unpaid orders for this table"""
        return self.orders.filter(status='unpaid')

    class Meta:
        db_table = 'tables'


class TableMerge(models.Model):
    """Model to track table merging operations"""
    main_table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='main_merges', 
                                  help_text='Main table that other tables are merged into')
    merged_tables = models.ManyToManyField(Table, related_name='merged_into', 
                                         help_text='Tables that are merged into the main table')
    created_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, 
                                  related_name='table_merges')
    created_at = models.DateTimeField(auto_now_add=True)
    separated_at = models.DateTimeField(null=True, blank=True, help_text='When tables were separated')
    separated_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, 
                                   related_name='table_separations', null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text='Whether the merge is currently active')
    
    def __str__(self):
        merged_names = ', '.join([t.name for t in self.merged_tables.all()])
        return f"Merged: {merged_names} → {self.main_table.name}"
    
    @property
    def total_tables_count(self):
        """Total number of tables in this merge (including main table)"""
        return self.merged_tables.count() + 1
    
    class Meta:
        db_table = 'table_merges'
        ordering = ['-created_at']
