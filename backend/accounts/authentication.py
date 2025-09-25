from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import User


class CustomJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication để work với custom User model"""
    
    def get_user(self, validated_token):
        """Override để sử dụng custom User model"""
        try:
            user_id = validated_token.payload.get('user_id')
            if not user_id:
                raise InvalidToken('Token không chứa user_id')
                
            user = User.objects.get(id=user_id, deleted_at__isnull=True)
            return user
        except User.DoesNotExist:
            raise InvalidToken('User không tồn tại hoặc đã bị xóa')
        except Exception as e:
            raise InvalidToken(f'Lỗi xác thực: {str(e)}')