from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from .models import User
from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer,
    ProfileSerializer
)
from .permissions import IsAdminUser, IsOwnerOrAdmin


class CustomUserAuthentication:
    """Custom authentication để làm việc với User model"""
    
    def authenticate(self, request, username=None, password=None):
        try:
            user = User.objects.get(username=username, deleted_at__isnull=True)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        return None


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Login user và trả về JWT tokens
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Tạo JWT tokens
        refresh = RefreshToken()
        refresh['user_id'] = user.id
        refresh['username'] = user.username
        refresh['role'] = user.role
        
        return Response({
            'success': True,
            'message': 'Login successfully',
            'data': {
                'user': UserSerializer(user).data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'message': 'Login failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/ - Lấy thông tin profile
    PUT  /api/auth/profile/ - Cập nhật profile
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'PUT':
            return ProfileSerializer
        return ProfileSerializer
    
    def get_object(self):
        # Tìm user dựa trên token JWT
        user_id = self.request.auth.payload.get('user_id') if self.request.auth else None
        if user_id:
            try:
                return User.objects.get(id=user_id, deleted_at__isnull=True)
            except User.DoesNotExist:
                pass
        return None
    
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        if not user:
            return Response({
                'success': False,
                'message': 'User does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(user)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if not user:
            return Response({
                'success': False,
                'message': 'User does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Profile update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/users/ - Lấy danh sách users (Admin only)
    POST /api/users/ - Tạo user mới (Admin only)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return User.objects.filter(deleted_at__isnull=True).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Created user successfully',
                'data': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Created user failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/users/{id}/ - Lấy thông tin user (Admin only)
    PUT    /api/users/{id}/ - Cập nhật user (Admin only)
    DELETE /api/users/{id}/ - Xóa user (Admin only)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return User.objects.filter(deleted_at__isnull=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Updated user successfully',
                'data': UserSerializer(user).data
            })
        
        return Response({
            'success': False,
            'message': 'Updated user failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        
        # Soft delete thay vì xóa thật
        user.deleted_at = timezone.now()
        user.save()
        
        return Response({
            'success': True,
            'message': 'Deleted user successfully'
        }, status=status.HTTP_204_NO_CONTENT)
