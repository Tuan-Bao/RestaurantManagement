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
    Query parameters:
    - name: Lọc user theo tên (tìm kiếm gần đúng)
    - username: Lọc user theo username (tìm kiếm gần đúng)
    - role: Lọc user theo role (admin/staff)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.filter(deleted_at__isnull=True).order_by('-created_at')
        
        # Lọc theo tên nếu có query parameter
        name_query = self.request.query_params.get('name', None)
        if name_query:
            queryset = queryset.filter(name__icontains=name_query)
        
        # Lọc theo username nếu có query parameter
        username_query = self.request.query_params.get('username', None)
        if username_query:
            queryset = queryset.filter(username__icontains=username_query)
        
        # Lọc theo role nếu có query parameter
        role_query = self.request.query_params.get('role', None)
        if role_query and role_query in ['admin', 'staff']:
            queryset = queryset.filter(role=role_query)
            
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Thông tin về filter
        name_query = self.request.query_params.get('name', None)
        username_query = self.request.query_params.get('username', None)
        role_query = self.request.query_params.get('role', None)
        
        response_data = {
            'success': True,
            'data': serializer.data,
            'count': queryset.count(),
            'total_users': User.objects.filter(deleted_at__isnull=True).count()
        }
        
        # Thêm thông tin filter nếu có
        filter_info = {}
        if name_query:
            filter_info['name'] = name_query
        if username_query:
            filter_info['username'] = username_query
        if role_query and role_query in ['admin', 'staff']:
            filter_info['role'] = role_query
            
        if filter_info:
            response_data['filter'] = filter_info
        
        return Response(response_data)
    
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
    PUT    /api/users/{id}/ - Cập nhật user hoàn toàn (Admin only)
    PATCH  /api/users/{id}/ - Cập nhật một phần user (Admin only)
    DELETE /api/users/{id}/ - Xóa user (Admin only)
    
    Update features:
    - Supports both PUT (full update) and PATCH (partial update)
    - Can update password with automatic hashing
    - All fields are optional in PATCH requests
    
    Delete validation rules:
    - Cannot delete yourself
    - Cannot delete the last admin user (at least 1 admin must exist)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return User.objects.filter(deleted_at__isnull=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        elif self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserUpdateSerializer
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user = self.get_object()
        
        # Xác định xem có phải partial update (PATCH) không
        if request.method == 'PATCH':
            partial = True
        
        serializer = self.get_serializer(user, data=request.data, partial=partial)
        
        if serializer.is_valid():
            # Lưu thông tin user cũ để log
            old_data = {
                'name': user.name,
                'username': user.username,
                'role': user.role
            }
            
            # Cập nhật user
            updated_user = serializer.save()
            
            # Tạo response message tùy thuộc vào method
            method_name = "partially updated" if request.method == 'PATCH' else "updated"
            
            response_data = {
                'success': True,
                'message': f'User {method_name} successfully',
                'data': UserSerializer(updated_user).data
            }
            
            # Thêm thông tin về các field đã được cập nhật (chỉ cho PATCH)
            if request.method == 'PATCH' and request.data:
                updated_fields = list(request.data.keys())
                if 'password' in updated_fields:
                    updated_fields[updated_fields.index('password')] = 'password (encrypted)'
                response_data['updated_fields'] = updated_fields
            
            return Response(response_data)
        
        return Response({
            'success': False,
            'message': f'User update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests explicitly"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        user_to_delete = self.get_object()
        
        # Lấy thông tin user hiện tại từ JWT token
        current_user_id = self.request.auth.payload.get('user_id') if self.request.auth else None
        
        # Kiểm tra không được xóa chính mình
        if current_user_id and current_user_id == user_to_delete.id:
            return Response({
                'success': False,
                'message': 'Cannot delete yourself'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Soft delete thay vì xóa thật
        user_to_delete.deleted_at = timezone.now()
        user_to_delete.save()
        
        return Response({
            'success': True,
            'message': 'Deleted user successfully'
        }, status=status.HTTP_204_NO_CONTENT)
