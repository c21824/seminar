from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer
from .serializers import CustomerSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'customer-service'})

class CustomerViewSet(viewsets.ModelViewSet):
  queryset = Customer.objects.all().order_by('-id')
  serializer_class = CustomerSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'customer-service', 'message': 'sample endpoint'})
