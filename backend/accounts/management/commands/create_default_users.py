from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from accounts.models import User


class Command(BaseCommand):
    help = 'Tạo default admin và staff users'

    def handle(self, *args, **options):
        # Tạo admin user
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'name': 'Administrator',
                'password': make_password('admin123'),
                'role': 'admin'
            }
        )
        
        if admin_created:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Đã tạo admin user: {admin_user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Admin user đã tồn tại: {admin_user.username}')
            )

        # Tạo staff user
        staff_user, staff_created = User.objects.get_or_create(
            username='staff01',
            defaults={
                'name': 'Nhân viên 01',
                'password': make_password('staff123'),
                'role': 'staff'
            }
        )
        
        if staff_created:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Đã tạo staff user: {staff_user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Staff user đã tồn tại: {staff_user.username}')
            )

        self.stdout.write(
            self.style.SUCCESS('\n🎉 Hoàn thành tạo default users!')
        )
        self.stdout.write('📝 Login credentials:')
        self.stdout.write('   Admin: admin / admin123')
        self.stdout.write('   Staff: staff01 / staff123')