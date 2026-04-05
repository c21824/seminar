from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
  class Meta:
    model = Payment
    fields = ['id', 'name', 'description', 'created_at', 'updated_at']
