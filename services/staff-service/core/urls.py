from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import StaffViewSet

router = DefaultRouter()
router.register(r'staff', StaffViewSet, basename='staff')

urlpatterns = [
  path('', include(router.urls)),
]
