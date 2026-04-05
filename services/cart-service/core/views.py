from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cart
from .serializers import CartSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'cart-service'})

class CartViewSet(viewsets.ModelViewSet):
  queryset = Cart.objects.all().order_by('-id')
  serializer_class = CartSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'cart-service', 'message': 'sample endpoint'})
