from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shipment
from .serializers import ShipmentSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'ship-service'})

class ShipmentViewSet(viewsets.ModelViewSet):
  queryset = Shipment.objects.all().order_by('-id')
  serializer_class = ShipmentSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'ship-service', 'message': 'sample endpoint'})
