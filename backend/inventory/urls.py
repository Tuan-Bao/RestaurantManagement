from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IngredientViewSet, StockInViewSet, StockOutViewSet, RecipeViewSet

router = DefaultRouter()
router.register(r"ingredients", IngredientViewSet, basename="ingredients")
router.register(r"stock-in", StockInViewSet, basename="stock-in")
router.register(r"stock-out", StockOutViewSet, basename="stock-out")
router.register(r"recipes", RecipeViewSet, basename="recipes")

urlpatterns = [
    path("", include(router.urls)),
]
