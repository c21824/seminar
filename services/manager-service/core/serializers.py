from rest_framework import serializers
from .models import Manager

class ManagerSerializer(serializers.ModelSerializer):
  class Meta:
    model = Manager
    fields = ['id', 'name', 'description', 'created_at', 'updated_at']
