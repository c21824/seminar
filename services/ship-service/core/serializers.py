from rest_framework import serializers
from .models import Shipment

class ShipmentSerializer(serializers.ModelSerializer):
  class Meta:
    model = Shipment
    fields = ['id', 'name', 'description', 'created_at', 'updated_at']
