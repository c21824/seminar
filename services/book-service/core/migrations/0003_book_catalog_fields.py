from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_book_price_cover_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='catalog_id',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='book',
            name='catalog_name',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
