from django.db import models
from django.contrib.auth.hashers import check_password


class User(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    ]
    
    name = models.CharField(max_length=255, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff', null=True, blank=True)
    is_active = models.BooleanField(default=False, help_text='True when user is logged in, False when logged out')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name or self.username} ({self.username})"

    def check_password(self, raw_password):
        """Check if the given password is correct."""
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        """Always return True. This is a way to tell if the user has been authenticated."""
        return True

    @property
    def is_anonymous(self):
        """Always return False. This is a way to tell if the user is anonymous."""
        return False

    @property
    def is_admin(self):
        """Check if user is admin."""
        return self.role == 'admin'

    @property
    def is_staff_member(self):
        """Check if user is staff."""
        return self.role == 'staff'

    class Meta:
        db_table = 'users'
