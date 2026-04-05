from django.contrib import admin
from django.urls import include, path
from gateway.views import healthz, routes, proxy, services_health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('healthz/', healthz),
    path('api/v1/healthz/', healthz),
    path('api/v1/routes/', routes),
    path('api/v1/services-health/', services_health),
    path('api/v1/proxy/<str:service>/<path:path>/', proxy),
]
