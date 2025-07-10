from rest_framework import serializers
from .models import Donor, Campaign, Donation, Comment
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DonorSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Donor
        fields = ['id', 'name', 'user']

class CampaignSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    class Meta:
        model = Campaign
        fields = ['id', 'title', 'description', 'goal', 'amount_raised', 
                 'category', 'location', 'image']

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['id', 'amount', 'campaign', 'donated_at']
        read_only_fields = ['donor']


class CommentSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.name', read_only=True)
    campaign = serializers.PrimaryKeyRelatedField(queryset=Campaign.objects.all())
    text = serializers.CharField()

    class Meta:
        model = Comment
        fields = ['id', 'campaign', 'text', 'donor_name', 'created_at']
