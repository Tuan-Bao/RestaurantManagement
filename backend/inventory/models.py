from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.db.models import F


# =========================
# INGREDIENTS
# =========================
class Ingredient(models.Model):
    class Unit(models.TextChoices):
        KG = "kg", "Kg"
        LITER = "liter", "Lít"
        PIECE = "piece", "Cái"

    class Status(models.TextChoices):
        ACTIVE = "active", "Đang dùng"
        LOW = "low", "Sắp hết"
        OUT = "out", "Hết hàng"

    name = models.CharField(max_length=200, unique=True)
    unit = models.CharField(max_length=10, choices=Unit.choices)
    stock_quantity = models.DecimalField(
        max_digits=12, decimal_places=3, default=Decimal("0.000"),
        validators=[MinValueValidator(Decimal("0"))]
    )
    min_quantity = models.DecimalField(
        max_digits=12, decimal_places=3, default=Decimal("0.000"),
        validators=[MinValueValidator(Decimal("0"))]
    )
    price_per_unit = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0"))]
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "ingredients"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_unit_display()})"

    def clean(self):
        if self.stock_quantity < 0:
            raise ValidationError("Số lượng tồn không được âm.")
        if self.min_quantity < 0:
            raise ValidationError("Ngưỡng cảnh báo không được âm.")

    def refresh_status(self, save=True):
        if self.stock_quantity <= 0:
            self.status = Ingredient.Status.OUT
        elif self.stock_quantity < self.min_quantity:
            self.status = Ingredient.Status.LOW
        else:
            self.status = Ingredient.Status.ACTIVE
        if save:
            self.save(update_fields=["status", "updated_at"])


# =========================
# STOCK IN
# =========================
class StockIn(models.Model):
    ingredient = models.ForeignKey(
        Ingredient, on_delete=models.PROTECT, related_name="stock_ins"
    )
    quantity = models.DecimalField(
        max_digits=12, decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))]
    )
    price = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))]
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="stock_ins"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stock_in"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["ingredient", "created_at"]),
        ]

    def __str__(self):
        return f"Stock In: {self.ingredient.name} +{self.quantity}"

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Số lượng nhập phải > 0.")

    def apply_to_inventory(self):
        """
        Cộng tồn kho. Mặc định cập nhật price_per_unit = giá nhập lần này.
        Gọi hàm này sau khi .save() (ví dụ trong serializer) để ghi tồn.
        """
        with transaction.atomic():
            ing = Ingredient.objects.select_for_update().get(pk=self.ingredient_id)
            ing.stock_quantity = F("stock_quantity") + self.quantity
            ing.price_per_unit = self.price
            ing.save(update_fields=["stock_quantity", "price_per_unit", "updated_at"])
        self.ingredient.refresh_from_db(fields=["stock_quantity"])
        self.ingredient.refresh_status()


# =========================
# STOCK OUT
# =========================
class StockOut(models.Model):
    class Reason(models.TextChoices):
        COOKING = "cooking", "Chế biến"
        CANCEL = "cancel", "Hủy"
        OTHER = "other", "Khác"

    ingredient = models.ForeignKey(
        Ingredient, on_delete=models.PROTECT, related_name="stock_outs"
    )
    quantity = models.DecimalField(
        max_digits=12, decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))]
    )
    reason = models.CharField(max_length=20, choices=Reason.choices, default=Reason.COOKING)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="stock_outs"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stock_out"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["ingredient", "created_at"]),
            models.Index(fields=["reason"]),
        ]

    def __str__(self):
        return f"Stock Out: {self.ingredient.name} -{self.quantity}"

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Số lượng xuất phải > 0.")

    def apply_to_inventory(self):
        """
        Trừ tồn kho có khóa bản ghi để tránh âm kho.
        """
        with transaction.atomic():
            ing = Ingredient.objects.select_for_update().get(pk=self.ingredient_id)
            ing.refresh_from_db(fields=["stock_quantity"])
            if ing.stock_quantity < self.quantity:
                raise ValidationError(
                    f"Tồn kho '{ing.name}' không đủ. Hiện có {ing.stock_quantity}."
                )
            ing.stock_quantity = F("stock_quantity") - self.quantity
            ing.save(update_fields=["stock_quantity", "updated_at"])
        self.ingredient.refresh_from_db(fields=["stock_quantity"])
        self.ingredient.refresh_status()


# =========================
# RECIPES
# =========================
class Recipe(models.Model):
    menu_item = models.ForeignKey(
        "menu.MenuItem", on_delete=models.CASCADE, related_name="recipes"
    )
    ingredient = models.ForeignKey(
        Ingredient, on_delete=models.PROTECT, related_name="recipes"
    )
    quantity_required = models.DecimalField(
        max_digits=12, decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))]
    )

    class Meta:
        db_table = "recipes"
        ordering = ["menu_item_id", "ingredient__name"]
        unique_together = ("menu_item", "ingredient")
        indexes = [
            models.Index(fields=["menu_item", "ingredient"]),
        ]

    def __str__(self):
        return f"{self.menu_item} - {self.ingredient} ({self.quantity_required})"
