import os
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from orders.models import Order, OrderItem
from tables.models import Table

print("=== DATABASE CHECK ===")
print(f"Total orders: {Order.objects.count()}")
print(f"Total tables: {Table.objects.count()}")

print("\n=== ORDERS ===")
for order in Order.objects.all():
    print(f"Order {order.id}:")
    print(f"  Table: {order.table.name if order.table else 'None'}")
    print(f"  Status: {order.status}")
    print(f"  Created: {order.created_at}")
    print(f"  Items count: {order.order_items.count()}")
    print()

print("\n=== ORDER ITEMS ===")
for item in OrderItem.objects.all():
    print(f"Item {item.id}: {item.menu_item.name if item.menu_item else 'No menu item'} (Order {item.order.id if item.order else 'No order'})")