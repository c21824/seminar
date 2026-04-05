from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'comment-rate-service'})

class ReviewViewSet(viewsets.ModelViewSet):
  queryset = Review.objects.all().order_by('-id')
  serializer_class = ReviewSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'comment-rate-service', 'message': 'sample endpoint'})
