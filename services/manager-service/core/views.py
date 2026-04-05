from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Manager
from .serializers import ManagerSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'manager-service'})

class ManagerViewSet(viewsets.ModelViewSet):
  queryset = Manager.objects.all().order_by('-id')
  serializer_class = ManagerSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'manager-service', 'message': 'sample endpoint'})
