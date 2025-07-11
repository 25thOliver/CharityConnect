from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator

from .models import Donor, Campaign, Donation, Admin
from .serializers import DonorSerializer, CampaignSerializer, DonationSerializer, AdminSerializer, CampaignCreateSerializer
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
from .utils import send_donation_confirmation_email, send_password_reset_email, generate_password_reset_url, send_welcome_email

class CampaignPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 50

# Custom permission class for admin roles
class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        try:
            admin = Admin.objects.get(user=request.user, is_active=True)
            return True
        except Admin.DoesNotExist:
            return False

class CanManageCampaigns(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        try:
            admin = Admin.objects.get(user=request.user, is_active=True)
            return admin.can_manage_campaigns
        except Admin.DoesNotExist:
            return False

class CanModerateContent(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        try:
            admin = Admin.objects.get(user=request.user, is_active=True)
            return admin.can_moderate_content
        except Admin.DoesNotExist:
            return False

class CanManageFinances(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        try:
            admin = Admin.objects.get(user=request.user, is_active=True)
            return admin.can_manage_finances
        except Admin.DoesNotExist:
            return False

class IsSuperAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        try:
            admin = Admin.objects.get(user=request.user, is_active=True)
            return admin.is_super_admin
        except Admin.DoesNotExist:
            return False

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()  # <-- Added back for DRF router
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign']

    def get_queryset(self):
        queryset = Comment.objects.all().order_by('-created_at')
        campaign_id = self.request.query_params.get('campaign', None)
        if campaign_id is not None:
            queryset = queryset.filter(campaign_id=campaign_id)
        return queryset

    def perform_create(self, serializer):
        try:
            donor = Donor.objects.get(user=self.request.user)
            serializer.save(donor=donor)
        except Donor.DoesNotExist:
            raise ValidationError({'error': 'Donor profile not found'})
        

    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)  # Add this line
        return super().create(request, *args, **kwargs)

# Admin Authentication
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=400)
        
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                # Check if user is an admin
                try:
                    admin = Admin.objects.get(user=user, is_active=True)
                    # Generate JWT token
                    from rest_framework_simplejwt.tokens import RefreshToken
                    refresh = RefreshToken.for_user(user)
                    
                    return Response({
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                        'admin': {
                            'id': admin.id,
                            'role': admin.role,
                            'role_display': admin.get_role_display(),
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                        }
                    })
                except Admin.DoesNotExist:
                    return Response({
                        'error': 'Access denied. Admin privileges required.'
                    }, status=403)
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=401)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid credentials'
            }, status=401)

# Admin Dashboard Views
class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            admin = Admin.objects.get(user=request.user)
            
            # Get dashboard statistics
            total_campaigns = Campaign.objects.count()
            active_campaigns = Campaign.objects.filter(is_active=True).count()
            total_donations = Donation.objects.count()
            total_amount_raised = sum([campaign.amount_raised for campaign in Campaign.objects.all()])
            total_donors = Donor.objects.count()
            
            return Response({
                'admin': {
                    'id': admin.id,
                    'role': admin.role,
                    'role_display': admin.get_role_display(),
                    'username': request.user.username,
                    'email': request.user.email,
                },
                'statistics': {
                    'total_campaigns': total_campaigns,
                    'active_campaigns': active_campaigns,
                    'total_donations': total_donations,
                    'total_amount_raised': float(total_amount_raised),
                    'total_donors': total_donors,
                }
            })
        except Admin.DoesNotExist:
            return Response({'error': 'Admin profile not found'}, status=404)

# Admin Campaign Management
class AdminCampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [CanManageCampaigns]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignCreateSerializer
        return CampaignSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        return Campaign.objects.all().order_by('-created_at')

# Admin User Management (Super Admin only)
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_queryset(self):
        return Admin.objects.all().order_by('-created_at')

# Admin Donation Management
class AdminDonationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [CanManageFinances]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['campaign', 'donor']
    search_fields = ['donor__name', 'campaign__title']
    
    def get_queryset(self):
        return Donation.objects.all().order_by('-donated_at')

# Admin Comment Management
class AdminCommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [CanModerateContent]
    
    def get_queryset(self):
        return Comment.objects.all().order_by('-created_at')

# Donor Signup Endpoint
class DonorSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')
        name = data.get('name')  # Accept full name
        email = data.get('email')  # Accept email

        # Validate required fields
        if not all([username, password, name, email]):
            return Response({
                'error': 'All fields are required: username, password, name, and email'
            }, status=400)

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)

        # Validate email format
        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError
        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'Please enter a valid email address'}, status=400)

        # Create user with email
        user = User.objects.create_user(username=username, password=password, email=email)
        user.first_name = name  # Store full name
        user.save()

        donor = Donor.objects.create(user=user, name=name.strip())  # Save donor profile

        # Send welcome email
        try:
            send_welcome_email(user, name.strip())
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            # Don't fail signup if email fails

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
            donation = serializer.save(donor=donor)
            
            # Update the campaign's amount_raised field
            campaign = donation.campaign
            campaign.amount_raised += donation.amount
            campaign.save()
            
            # Send confirmation email
            try:
                send_donation_confirmation_email(donation, donor, campaign)
            except Exception as e:
                print(f"Failed to send confirmation email: {e}")
                # Don't fail the donation if email fails
            
        except Donor.DoesNotExist:
            raise ValidationError({'error': 'Donor profile not found for this user'})

    def perform_destroy(self, instance):
        # Decrement the campaign's amount_raised field when donation is deleted
        campaign = instance.campaign
        campaign.amount_raised -= instance.amount
        campaign.save()
        
        # Delete the donation
        instance.delete()


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


# Get current user's profile information
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    try:
        donor = Donor.objects.get(user=request.user)
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'full_name': donor.name,
            'first_name': request.user.first_name,
        })
    except Donor.DoesNotExist:
        return Response({'error': 'Donor profile not found'}, status=404)
    except Exception as e:
        print("🔥 my_profile error:", e)
        return Response({'error': 'Unable to retrieve profile'}, status=500)


# Password Reset Views
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        try:
            user = User.objects.get(email=email)
            reset_url = generate_password_reset_url(user, request)
            
            # Send password reset email
            if send_password_reset_email(user, reset_url):
                return Response({
                    'message': 'Password reset email sent successfully. Please check your email.'
                }, status=200)
            else:
                return Response({
                    'error': 'Failed to send password reset email. Please try again.'
                }, status=500)
                
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=200)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uidb64, token, new_password]):
            return Response({
                'error': 'All fields are required'
            }, status=400)
        
        try:
            from django.utils.http import urlsafe_base64_decode
            from django.utils.encoding import force_str
            
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            # Check if token is valid
            if default_token_generator.check_token(user, token):
                # Set new password
                user.set_password(new_password)
                user.save()
                
                return Response({
                    'message': 'Password reset successful. You can now login with your new password.'
                }, status=200)
            else:
                return Response({
                    'error': 'Invalid or expired reset link. Please request a new one.'
                }, status=400)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'Invalid reset link. Please request a new one.'
            }, status=400)
