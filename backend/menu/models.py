from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name or f"Category {self.id}"

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'

class MenuItem(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
    ]
    
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name='menu_items')
    name = models.CharField(max_length=200, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name or f"MenuItem {self.id}"

    class Meta:
        db_table = 'menu_items'

class Recipe(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, null=True, blank=True, related_name='recipes')
    ingredient = models.ForeignKey('inventory.Ingredient', on_delete=models.CASCADE, null=True, blank=True, related_name='recipes')
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
#model