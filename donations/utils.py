from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
import uuid


def send_donation_confirmation_email(donation, donor, campaign):
    """
    Send donation confirmation email to donor
    """
    subject = f'Thank you for your donation to {campaign.title}'
    
    # Generate a simple transaction ID
    transaction_id = str(uuid.uuid4())[:8].upper()
    
    context = {
        'donor_name': donor.name,
        'campaign_title': campaign.title,
        'amount': f"KES {donation.amount:,.2f}",
        'donation_date': donation.donated_at.strftime('%B %d, %Y at %I:%M %p'),
        'transaction_id': transaction_id,
    }
    
    # Render HTML email
    html_message = render_to_string('donations/emails/donation_confirmation.html', context)
    
    # Create plain text version
    plain_message = strip_tags(html_message)
    
    # Send email
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[donor.user.email] if donor.user.email else [],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send donation confirmation email: {e}")
        return False


def send_password_reset_email(user, reset_url):
    """
    Send password reset email to user
    """
    subject = 'Password Reset Request - Charity Donation Platform'
    
    context = {
        'reset_url': reset_url,
    }
    
    # Render HTML email
    html_message = render_to_string('donations/emails/password_reset.html', context)
    
    # Create plain text version
    plain_message = strip_tags(html_message)
    
    # Send email
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email] if user.email else [],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        return False


def generate_password_reset_url(user, request):
    """
    Generate password reset URL with token
    """
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Get the frontend URL from request
    frontend_url = request.build_absolute_uri('/').rstrip('/')
    reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"
    
    return reset_url 


def send_welcome_email(user, donor_name):
    """
    Send welcome email to new user
    """
    subject = f'Welcome to CharityConnect, {donor_name}!'
    
    context = {
        'donor_name': donor_name,
        'username': user.username,
    }
    
    # For now, we'll use a simple text email
    message = f"""
    Dear {donor_name},
    
    Welcome to CharityConnect! 🎉
    
    Thank you for joining our community of changemakers. Your account has been successfully created and you're now part of a global movement to make a positive impact.
    
    Account Details:
    - Username: {user.username}
    - Email: {user.email}
    
    What you can do now:
    ✅ Browse and donate to campaigns
    ✅ Track your donation history
    ✅ Leave comments on campaigns
    ✅ Reset your password if needed
    ✅ Receive updates on campaign progress
    
    Your first step towards making a difference starts now!
    
    Ready to make an impact? Visit our platform and explore the campaigns that speak to your heart.
    
    Thank you for choosing to be part of the solution.
    
    Best regards,
    The CharityConnect Team
    
    ---
    "The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi
    """
    
    # Send email
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email] if user.email else [],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
        return False 