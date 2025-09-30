from django.db import models

class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
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
    def current_orders(self):
        """Get current unpaid orders for this table"""
        return self.orders.filter(status='unpaid')

    class Meta:
        db_table = 'tables'