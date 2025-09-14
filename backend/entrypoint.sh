#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations accounts
python manage.py makemigrations tables
python manage.py makemigrations menu
python manage.py makemigrations orders
python manage.py makemigrations inventory
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123', name='Administrator', role='admin')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

# Start the server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000