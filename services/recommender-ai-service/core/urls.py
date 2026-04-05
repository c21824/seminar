from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import RecommendationViewSet

router = DefaultRouter()
router.register(r'recommendations', RecommendationViewSet, basename='recommendations')

urlpatterns = [
  path('', include(router.urls)),
]
