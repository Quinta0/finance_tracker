#!/bin/bash

# Wait for database to be ready (not needed for SQLite but good practice)
echo "Starting Django backend..."

# Show current migration status
echo "Current migration status:"
python manage.py showmigrations

# Create migrations if they don't exist
echo "Creating migrations..."
python manage.py makemigrations finance

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Show migration status after running migrations
echo "Migration status after running migrations:"
python manage.py showmigrations

# Create default categories if they don't exist
python manage.py shell << EOF
from finance.models import Category
if not Category.objects.exists():
    print("Creating default categories...")
    # Income categories
    Category.objects.create(name='salary', type='income', color='#10b981', icon='💼')
    Category.objects.create(name='freelance', type='income', color='#3b82f6', icon='💻')
    Category.objects.create(name='investments', type='income', color='#8b5cf6', icon='📈')
    Category.objects.create(name='gifts', type='income', color='#ec4899', icon='🎁')
    Category.objects.create(name='Dividends', type='income', color='#ec4899', icon='💰')
    
    # Expense categories
    Category.objects.create(name='food', type='expense', color='#ef4444', icon='🍕')
    Category.objects.create(name='transportation', type='expense', color='#f97316', icon='🚗')
    Category.objects.create(name='entertainment', type='expense', color='#f59e0b', icon='🎬')
    Category.objects.create(name='shopping', type='expense', color='#84cc16', icon='🛍️')
    Category.objects.create(name='healthcare', type='expense', color='#06b6d4', icon='🏥')
    Category.objects.create(name='education', type='expense', color='#8b5cf6', icon='📚')
    Category.objects.create(name='travel', type='expense', color='#ec4899', icon='✈️')
    Category.objects.create(name='utilities', type='expense', color='#f59e0b', icon='💡')
    Category.objects.create(name='other', type='expense', color='#6b7280', icon='📦')
    print("Default categories created!")
else:
    print("Categories already exist, skipping creation...")
EOF

# Collect static files (if any)
python manage.py collectstatic --noinput

# Start the server
exec python manage.py runserver 0.0.0.0:8000
