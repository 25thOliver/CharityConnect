# Generated by Django 5.2.4 on 2025-07-11 23:17

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('donations', '0006_remove_campaign_image'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='campaign',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_campaigns', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='campaign',
            name='featured',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='campaign',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name='Admin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('super_admin', 'Super Admin'), ('campaign_manager', 'Campaign Manager'), ('content_moderator', 'Content Moderator'), ('financial_manager', 'Financial Manager')], default='campaign_manager', max_length=50)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
