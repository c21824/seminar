from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'order-service'})

class OrderViewSet(viewsets.ModelViewSet):
  queryset = Order.objects.all().order_by('-id')
  serializer_class = OrderSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'order-service', 'message': 'sample endpoint'})
