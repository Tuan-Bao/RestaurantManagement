from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Permission class để check user có role admin không
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            hasattr(request.user, 'role') and 
            request.user.role == 'admin'
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Permission class để check user là chủ sở hữu hoặc admin
    """
    def has_object_permission(self, request, view, obj):
        # Admin có thể làm tất cả
        if hasattr(request.user, 'role') and request.user.role == 'admin':
            return True
        
        # User chỉ có thể sửa profile của chính mình
        return obj.id == request.user.id