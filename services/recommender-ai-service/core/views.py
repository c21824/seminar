from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Recommendation
from .serializers import RecommendationSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'recommender-ai-service'})

class RecommendationViewSet(viewsets.ModelViewSet):
  queryset = Recommendation.objects.all().order_by('-id')
  serializer_class = RecommendationSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'recommender-ai-service', 'message': 'sample endpoint'})
