from django.db import models
from django.conf import settings
from menu.models import MenuItem

class Ingredient(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('piece', 'Piece'),
    ]
    
    name = models.CharField(max_length=200, null=True, blank=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.unit})" if self.name and self.unit else f"Ingredient {self.id}"

    class Meta:
        db_table = 'ingredients'

class Storage(models.Model):
    ingredient = models.OneToOneField(Ingredient, on_delete=models.CASCADE, null=True, blank=True, related_name='storage')
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, null=True, blank=True)
    min_quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ingredient.name if self.ingredient else 'N/A'} - Stock: {self.stock_quantity}"

    @property
    def is_low_stock(self):
        return (self.stock_quantity or 0) <= (self.min_quantity or 0)

    class Meta:
        db_table = 'storages'

class StockIn(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True, related_name='stock_ins')
    quantity = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='stock_ins')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Stock In: {self.ingredient.name if self.ingredient else 'N/A'} +{self.quantity}"

    class Meta:
        db_table = 'stock_in'

class StockOut(models.Model):
    REASON_CHOICES = [
        ('cooking', 'Cooking'),
        ('cancel', 'Cancelled'),
        ('other', 'Other'),
    ]
    
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True, related_name='stock_outs')
    quantity = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='stock_outs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Stock Out: {self.ingredient.name if self.ingredient else 'N/A'} -{self.quantity}"

    class Meta:
        db_table = 'stock_out'

class Recipe(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, null=True, blank=True, related_name='recipes')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True, related_name='recipes')
    quantity_required = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        menu_name = self.menu_item.name if self.menu_item else 'N/A'
        ingredient_name = self.ingredient.name if self.ingredient else 'N/A'
        return f"{menu_name} - {ingredient_name}: {self.quantity_required}"

    class Meta:
        db_table = 'recipes'
        unique_together = ['menu_item', 'ingredient']
