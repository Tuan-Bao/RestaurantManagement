from decimal import Decimal
from django.db import transaction
from django.db.models import F, Q
from rest_framework import viewsets, permissions, decorators, response, status
from .models import Ingredient, StockIn, StockOut, Recipe
from .serializers import (
    IngredientSerializer,
    StockInSerializer,
    StockOutSerializer,
    RecipeSerializer,
)


class IsStaffOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user and request.user.is_authenticated


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [IsStaffOrReadOnly]

    @decorators.action(detail=False, methods=["get"])
    def reorder(self, request):
        """Danh sách nguyên liệu cần nhập (tồn <= min)."""
        qs = Ingredient.need_reorder().order_by("name")
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page or qs, many=True)
        return self.get_paginated_response(ser.data) if page else response.Response(ser.data)


class StockInViewSet(viewsets.ModelViewSet):
    queryset = StockIn.objects.select_related("ingredient", "user")
    serializer_class = StockInSerializer
    permission_classes = [permissions.IsAuthenticated]


class StockOutViewSet(viewsets.ModelViewSet):
    queryset = StockOut.objects.select_related("ingredient", "user")
    serializer_class = StockOutSerializer
    permission_classes = [permissions.IsAuthenticated]


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.select_related("menu_item", "ingredient")
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    @decorators.action(detail=False, methods=["post"])
    @transaction.atomic
    def consume_recipe(self, request):
        """
        Trừ kho theo công thức cho 1 món.
        Body: { "menu_item": <id>, "quantity": <số phần> }
        """
        menu_item_id = request.data.get("menu_item")
        qty = Decimal(str(request.data.get("quantity", "1")))
        if not menu_item_id or qty <= 0:
            return response.Response(
                {"detail": "menu_item và quantity > 0 là bắt buộc."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        lines = Recipe.objects.filter(menu_item_id=menu_item_id).select_related("ingredient")
        if not lines.exists():
            return response.Response({"detail": "Món chưa có công thức."}, status=400)

        # kiểm tra đủ tồn
        lacking = []
        for r in lines:
            need = r.quantity_required * qty
            if r.ingredient.stock_quantity < need:
                lacking.append({"ingredient": r.ingredient.name, "need": str(need), "has": str(r.ingredient.stock_quantity)})
        if lacking:
            return response.Response({"detail": "Không đủ tồn cho công thức.", "lacking": lacking}, status=400)

        # tạo các phiếu xuất (reason=chế biến)
        outs = []
        for r in lines:
            out = StockOut.objects.create(
                ingredient=r.ingredient,
                quantity=r.quantity_required * qty,
                reason=StockOut.Reason.COOKING,
                user=request.user,
            )
            out.apply_to_inventory()
            outs.append(out.id)

        return response.Response({"status": "ok", "stockout_ids": outs}, status=201)
