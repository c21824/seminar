from rest_framework import serializers
from .models import CatalogItem

class CatalogItemSerializer(serializers.ModelSerializer):
  class Meta:
    model = CatalogItem
    fields = ['id', 'name', 'description', 'created_at', 'updated_at']
