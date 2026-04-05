from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CatalogItemViewSet

router = DefaultRouter()
router.register(r'catalog-items', CatalogItemViewSet, basename='catalog-items')

urlpatterns = [
  path('', include(router.urls)),
]
