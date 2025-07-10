from django.contrib import admin
from .models import Campaign


# Register your models here.
@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'location', 'goal', 'amount_raised')
    search_fields = ('title', 'category', 'location')
    fields = ('title', 'category', 'location', 'description', 'goal', 'amount_raised')  # 👈 include description
