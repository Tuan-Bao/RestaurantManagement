from django.db import models


class Ingredient(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('piece', 'Piece'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    name = models.CharField(max_length=200, null=True, blank=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, null=True, blank=True)
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, null=True, blank=True)
    min_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, null=True, blank=True, help_text='Minimum stock threshold for alert')
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text='Current price per unit')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.unit})" if self.name and self.unit else f"Ingredient {self.id}"

    @property
    def is_low_stock(self):
        """Check if current stock is below minimum threshold"""
        return (self.stock_quantity or 0) <= (self.min_quantity or 0)

    @property
    def total_value(self):
        """Calculate total value of current stock"""
        if self.stock_quantity and self.price_per_unit:
            return self.stock_quantity * self.price_per_unit
        return 0

    class Meta:
        db_table = 'ingredients'


class StockIn(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True, related_name='stock_ins')
    quantity = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text='Total price for this quantity')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True, related_name='stock_ins')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Stock In: {self.ingredient.name if self.ingredient else 'N/A'} +{self.quantity}"

    @property
    def price_per_unit(self):
        """Calculate price per unit for this stock-in"""
        if self.quantity and self.price and self.quantity > 0:
            return self.price / self.quantity
        return 0

    class Meta:
        db_table = 'stock_in'
        ordering = ['-created_at']


class StockOut(models.Model):
    REASON_CHOICES = [
        ('processing', 'Processing/Cooking'),
        ('cancel', 'Cancelled'),
        ('other', 'Other'),
    ]
    
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True, related_name='stock_outs')
    quantity = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, null=True, blank=True)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True, related_name='stock_outs')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Stock Out: {self.ingredient.name if self.ingredient else 'N/A'} -{self.quantity}"

    class Meta:
        db_table = 'stock_out'
        ordering = ['-created_at']
