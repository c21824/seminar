from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
  def validate(self, attrs):
    catalog_name = attrs.get('catalog_name', getattr(self.instance, 'catalog_name', ''))
    if not catalog_name:
      raise serializers.ValidationError({'catalog_name': 'Catalog is required.'})

    price_value = attrs.get('price', getattr(self.instance, 'price', 0))
    if price_value is None or price_value <= 0:
      raise serializers.ValidationError({'price': 'Price must be greater than 0.'})

    return attrs

  class Meta:
    model = Book
    fields = ['id', 'name', 'description', 'catalog_id', 'catalog_name', 'price', 'cover_image', 'created_at', 'updated_at']
