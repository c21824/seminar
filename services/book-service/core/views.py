from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer

def healthz(request):
  return JsonResponse({'status': 'ok', 'service': 'book-service'})

class BookViewSet(viewsets.ModelViewSet):
  queryset = Book.objects.all().order_by('-id')
  serializer_class = BookSerializer

  @action(detail=False, methods=['get'])
  def sample(self, request):
    return Response({'service': 'book-service', 'message': 'sample endpoint'})
