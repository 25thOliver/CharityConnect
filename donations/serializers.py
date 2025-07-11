from rest_framework import serializers
from .models import Donor, Campaign, Donation, Comment, Admin
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

class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = Admin
        fields = ['id', 'user', 'role', 'is_active', 'created_at', 'updated_at', 
                 'username', 'password', 'email', 'first_name']
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        # Extract user data
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        
        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            is_staff=True  # Make admin users staff
        )
        
        # Create admin
        admin = Admin.objects.create(user=user, **validated_data)
        return admin

class CampaignSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Campaign
        fields = ['id', 'title', 'description', 'goal', 'amount_raised', 
                 'category', 'location', 'image', 'created_at', 'created_by', 
                 'created_by_username', 'is_active', 'featured']
        read_only_fields = ['amount_raised', 'created_at', 'created_by']

class CampaignCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    
    class Meta:
        model = Campaign
        fields = ['title', 'description', 'goal', 'category', 'location', 'image', 'featured']

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
