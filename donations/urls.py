from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonorViewSet, CampaignViewSet, DonationViewSet, DonorSignupView, my_donations, CommentViewSet

router = DefaultRouter()
router.register(r'donors', DonorViewSet)
router.register(r'campaigns', CampaignViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'comments', CommentViewSet)  # ✅ register goes here

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', DonorSignupView.as_view(), name='donor-signup'),
    path('my-donations/', my_donations, name='my-donations'),
]
