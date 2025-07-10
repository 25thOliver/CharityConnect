from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

image = models.URLField(blank=True, null=True)


class Comment(models.Model):
    campaign = models.ForeignKey("Campaign", on_delete=models.CASCADE, related_name='comments')
    donor = models.ForeignKey("Donor", on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

class Donor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Campaign(models.Model):
    CATEGORY_CHOICES = [
        ('Health', 'Health'),
        ('Education', 'Education'),
        ('Water', 'Water'),
        ('Food', 'Food'),
        ('Emergency', 'Emergency'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    goal = models.DecimalField(max_digits=12, decimal_places=2, default=100000)
    amount_raised = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Health')
    location = models.CharField(max_length=100, default="Nairobi")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Donation(models.Model):
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    donated_at = models.DateTimeField(auto_now_add=True)
