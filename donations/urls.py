from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DonorViewSet, CampaignViewSet, DonationViewSet, DonorSignupView, 
    my_donations, my_profile, CommentViewSet, PasswordResetRequestView, 
    PasswordResetConfirmView, AdminLoginView, AdminDashboardView, 
    AdminCampaignViewSet, AdminUserViewSet, AdminDonationViewSet, AdminCommentViewSet
)

router = DefaultRouter()
router.register(r'donors', DonorViewSet)
router.register(r'campaigns', CampaignViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'comments', CommentViewSet)  # ✅ register goes here

# Admin routers
admin_router = DefaultRouter()
admin_router.register(r'campaigns', AdminCampaignViewSet, basename='admin-campaigns')
admin_router.register(r'users', AdminUserViewSet, basename='admin-users')
admin_router.register(r'donations', AdminDonationViewSet, basename='admin-donations')
admin_router.register(r'comments', AdminCommentViewSet, basename='admin-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', DonorSignupView.as_view(), name='donor-signup'),
    path('my-donations/', my_donations, name='my-donations'),
    path('my-profile/', my_profile, name='my-profile'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Admin endpoints
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/', include(admin_router.urls)),
]
