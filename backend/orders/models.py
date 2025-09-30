from django.db import models
from tables.models import Table
from menu.models import MenuItem

class Order(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
    ]
    
    table = models.ForeignKey(Table, on_delete=models.CASCADE, null=True, blank=True, related_name='orders')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - Table {self.table.name if self.table else 'N/A'}"

    class Meta:
        db_table = 'orders'

class OrderItem(models.Model):
    STATUS_CHOICES = [
        ('ordered', 'Ordered'),
        ('cancelled', 'Cancelled'),  # Fixed typo: cancel → cancelled
        ('cooking', 'Cooking'),
        ('done', 'Done'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True, related_name='order_items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, null=True, blank=True, related_name='order_items')
    quantity = models.IntegerField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ordered', null=True, blank=True)
    price_each = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order.id if self.order else 'N/A'} - {self.menu_item.name if self.menu_item else 'N/A'}"

    class Meta:
        db_table = 'orders_items'

class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('e_wallet', 'E-Wallet'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Order {self.order.id if self.order else 'N/A'} - {self.amount}"

    class Meta:
        db_table = 'payments'
