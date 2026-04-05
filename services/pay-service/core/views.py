from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'pay-service'})

class PaymentViewSet(viewsets.ModelViewSet):
  queryset = Payment.objects.all().order_by('-id')
  serializer_class = PaymentSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'pay-service', 'message': 'sample endpoint'})
