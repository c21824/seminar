from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from core.views import healthz

urlpatterns = [
    path('admin/', admin.site.urls),
    path('healthz/', healthz),
    path('api/v1/', include('core.urls')),
]
