from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Staff
from .serializers import StaffSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'staff-service'})

class StaffViewSet(viewsets.ModelViewSet):
  queryset = Staff.objects.all().order_by('-id')
  serializer_class = StaffSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'staff-service', 'message': 'sample endpoint'})
