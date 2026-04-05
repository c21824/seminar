from django.db import models

class Book(models.Model):
  name = models.CharField(max_length=255)
  description = models.TextField(blank=True)
  catalog_id = models.IntegerField(null=True, blank=True)
  catalog_name = models.CharField(max_length=255, blank=True)
  price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
  cover_image = models.TextField(blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    ordering = ['-id']

  def __str__(self):
    return self.name
