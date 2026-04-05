from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CatalogItem
from .serializers import CatalogItemSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'catalog-service'})

class CatalogItemViewSet(viewsets.ModelViewSet):
  queryset = CatalogItem.objects.all().order_by('-id')
  serializer_class = CatalogItemSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'catalog-service', 'message': 'sample endpoint'})
