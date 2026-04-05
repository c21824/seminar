from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ShipmentViewSet

router = DefaultRouter()
router.register(r'shipments', ShipmentViewSet, basename='shipments')

urlpatterns = [
  path('', include(router.urls)),
]
