from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User

from .models import Donor, Campaign, Donation
from .serializers import DonorSerializer, CampaignSerializer, DonationSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from rest_framework import viewsets
from .models import Comment
from .serializers import CommentSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser

from donations.models import Campaign
from donations.serializers import CampaignSerializer
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

class CampaignPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 50

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')  # ⚠️ Add sorting
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        try:
            donor = Donor.objects.get(user=self.request.user)
            serializer.save(donor=donor)
        except Donor.DoesNotExist:
            raise ValidationError({'error': 'Donor profile not found'})
        

    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)  # Add this line
        return super().create(request, *args, **kwargs)



# Donor Signup Endpoint
class DonorSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        name = data.get('name')  # Accept full name

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        user.first_name = name  # Store full name
        user.save()

        Donor.objects.create(user=user, name=name.strip())  # Save donor profile

        return Response({'message': 'Signup successful'}, status=201)


# Campaigns (publicly accessible)
class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'location']
    search_fields = ['title', 'description']
    ordering_fields = ['goal','amount_raised', 'created_at']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser]
    search_fields = ['title', 'description']

    def get_queryset(self):
        qs = super().get_queryset()
        # apply category, location, search, ordering filters here
        return qs


# Donor management
class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]


# Donations (only authenticated users)
class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            donor = Donor.objects.get(user=self.request.user)
            serializer.save(donor=donor)
        except Donor.DoesNotExist:
            raise ValidationError({'error': 'Donor profile not found for this user'})


# Fetch authenticated user's donation history
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_donations(request):
    try:
        donor = Donor.objects.get(user=request.user)
        donations = Donation.objects.filter(donor=donor).order_by('-donated_at')  # ✅ fixed field
        serializer = DonationSerializer(donations, many=True)
        return Response(serializer.data)
    except Exception as e:
        print("🔥 my_donations error:", e)
        return Response({'error': 'Unable to retrieve donations'}, status=500)
