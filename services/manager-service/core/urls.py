from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ManagerViewSet

router = DefaultRouter()
router.register(r'managers', ManagerViewSet, basename='managers')

urlpatterns = [
  path('', include(router.urls)),
]
