# 📚 RESTAURANT MANAGEMENT SYSTEM - API DOCUMENTATION

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Table Management APIs](#table-management-apis)
4. [Menu Management APIs](#menu-management-apis)
5. [Order Management APIs](#order-management-apis)
6. [Inventory Management APIs](#inventory-management-apis)
7. [Dashboard APIs](#dashboard-apis)

---

## 🔐 Authentication APIs

### 1. Login

**Endpoint:** `POST /api/auth/login/`  
**Permission:** AllowAny  
**Description:** Đăng nhập và nhận JWT tokens

**Request Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Admin User",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Login failed",
  "errors": {
    "non_field_errors": ["Invalid username or password"]
  }
}
```

---

### 2. Logout

**Endpoint:** `POST /api/auth/logout/`  
**Permission:** IsAuthenticated  
**Description:** Đăng xuất và set is_active = False

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successfully"
}
```

---

### 3. Get Profile

**Endpoint:** `GET /api/auth/profile/`  
**Permission:** IsAuthenticated  
**Description:** Xem thông tin cá nhân

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "Admin User",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 4. Update Profile

**Endpoint:** `PUT /api/auth/profile/`  
**Permission:** IsAuthenticated  
**Description:** Cập nhật thông tin cá nhân

**Request Body:**

```json
{
  "name": "Updated Name",
  "password": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "Updated Name",
    "role": "admin"
  }
}
```

---

## 👥 User Management APIs

### 5. List Users

**Endpoint:** `GET /api/users/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Danh sách users với filtering

**Query Parameters:**

- `name`: Lọc theo tên (tìm kiếm gần đúng)
- `username`: Lọc theo username (tìm kiếm gần đúng)
- `role`: Lọc theo role (admin/staff)
- `is_active`: Lọc theo trạng thái hoạt động (true/false)

**Example:** `GET /api/users/?name=Nguyen&role=staff`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "staff01",
      "name": "Nguyen Van A",
      "role": "staff",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "total_users": 10,
  "filter": {
    "name": "Nguyen",
    "role": "staff"
  }
}
```

---

### 6. Create User

**Endpoint:** `POST /api/users/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Tạo user mới

**Request Body:**

```json
{
  "username": "staff02",
  "name": "Tran Van B",
  "password": "password123",
  "role": "staff"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Created user successfully",
  "data": {
    "id": 2,
    "username": "staff02",
    "name": "Tran Van B",
    "role": "staff",
    "is_active": false
  }
}
```

---

### 7. Get User Detail

**Endpoint:** `GET /api/users/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Xem chi tiết user

**Response (200):**

```json
{
  "id": 1,
  "username": "staff01",
  "name": "Nguyen Van A",
  "role": "staff",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 8. Update User (Full)

**Endpoint:** `PUT /api/users/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật user hoàn toàn

**Request Body:**

```json
{
  "name": "Updated Name",
  "username": "staff01_updated",
  "role": "admin",
  "password": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "username": "staff01_updated",
    "name": "Updated Name",
    "role": "admin"
  }
}
```

---

### 9. Update User (Partial)

**Endpoint:** `PATCH /api/users/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật một phần user (bao gồm password)

**Request Body:**

```json
{
  "name": "New Name"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User partially updated successfully",
  "data": {
    "id": 1,
    "username": "staff01",
    "name": "New Name",
    "role": "staff"
  },
  "updated_fields": ["name"]
}
```

---

### 10. Delete User

**Endpoint:** `DELETE /api/users/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Xóa user (soft delete)

**Business Rules:**

- Không được xóa chính mình
- Phải tồn tại ít nhất 1 admin

**Response (204):**

```json
{
  "success": true,
  "message": "Deleted user successfully"
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Cannot delete yourself"
}
```

---

## 🪑 Table Management APIs

### 11. List Tables

**Endpoint:** `GET /api/tables/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Danh sách bàn với filtering

**Query Parameters:**

- `floor`: Lọc theo tầng
- `status`: Lọc theo trạng thái (available/unavailable)
- `search`: Tìm kiếm theo tên bàn

**Example:** `GET /api/tables/?floor=1&status=available`

**Response (200):**

```json
{
  "success": true,
  "message": "Retrieved tables successfully",
  "data": [
    {
      "id": 1,
      "name": "Bàn 1",
      "floor": 1,
      "status": "available",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 12. Create Table

**Endpoint:** `POST /api/tables/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Tạo bàn mới

**Request Body:**

```json
{
  "name": "Bàn 10",
  "floor": 2
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Created table successfully",
  "data": {
    "id": 10,
    "name": "Bàn 10",
    "floor": 2,
    "status": "available"
  }
}
```

---

### 13. Get Table Detail

**Endpoint:** `GET /api/tables/{id}/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Xem chi tiết bàn

**Response (200):**

```json
{
  "id": 1,
  "name": "Bàn 1",
  "floor": 1,
  "status": "available",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 14. Update Table

**Endpoint:** `PATCH /api/tables/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật thông tin bàn (name, floor)

**Request Body:**

```json
{
  "name": "Bàn VIP 1",
  "floor": 3
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Updated table successfully",
  "data": {
    "id": 1,
    "name": "Bàn VIP 1",
    "floor": 3,
    "status": "available"
  }
}
```

---

### 15. Delete Table

**Endpoint:** `DELETE /api/tables/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Xóa bàn (soft delete)

**Business Rules:**

- Không thể xóa bàn đang có khách (status = unavailable)

**Response (204):**

```json
{
  "success": true,
  "message": "Deleted table successfully"
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Cannot delete table that is currently occupied"
}
```

---

### 16. Change Table Status

**Endpoint:** `PATCH /api/tables/{id}/status/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Thay đổi trạng thái bàn

**Request Body:**

```json
{
  "status": "unavailable"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Table status changed to unavailable",
  "data": {
    "id": 1,
    "name": "Bàn 1",
    "status": "unavailable"
  }
}
```

---

### 17. Table Statistics

**Endpoint:** `GET /api/tables/stats/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Thống kê bàn

**Response (200):**

```json
{
  "success": true,
  "message": "Retrieved table statistics successfully",
  "data": {
    "total": 20,
    "available": 15,
    "unavailable": 5,
    "by_floor": {
      "floor_1": {
        "total": 10,
        "available": 8,
        "unavailable": 2
      },
      "floor_2": {
        "total": 10,
        "available": 7,
        "unavailable": 3
      }
    }
  }
}
```

---

### 18. Change Table (Move Order)

**Endpoint:** `POST /api/tables/change/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Chuyển bàn cho order

**Business Rules:**

- Bàn nguồn phải có status 'unavailable' (có order unpaid)
- Bàn đích phải có status 'available'
- Sau khi chuyển: bàn nguồn → 'available', bàn đích → 'unavailable'

**Request Body:**

```json
{
  "from_table_id": 5,
  "to_table_id": 2
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully moved 1 order(s) from Bàn 5 to Bàn 2",
  "data": {
    "moved_orders_count": 1,
    "from_table": {
      "id": 5,
      "name": "Bàn 5",
      "status": "available"
    },
    "to_table": {
      "id": 2,
      "name": "Bàn 2",
      "status": "unavailable"
    }
  }
}
```

---

### 19. Get Table Order

**Endpoint:** `GET /api/tables/{id}/order/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Lấy order unpaid của bàn (chỉ unavailable tables)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "status": "unpaid",
    "total_amount": "450000.00",
    "created_at": "2024-01-15T14:30:00Z",
    "user": {
      "id": 1,
      "username": "staff01"
    },
    "table": {
      "id": 5,
      "name": "Bàn 5",
      "floor": 2
    },
    "order_items": [
      {
        "id": 20,
        "quantity": 2,
        "status": "ordered",
        "menu_item": {
          "name": "Phở bò",
          "price": "80000.00"
        }
      }
    ]
  },
  "table_info": {
    "table_id": 5,
    "table_name": "Bàn 5",
    "floor": 2,
    "status": "unavailable"
  }
}
```

---

## 🍽️ Menu Management APIs

### 20. List Categories

**Endpoint:** `GET /api/menu/categories/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Danh sách danh mục món ăn

**Query Parameters:**

- `name`: Lọc theo tên danh mục

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Món chính",
      "description": "Các món ăn chính",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 21. Create Category

**Endpoint:** `POST /api/menu/categories/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Tạo danh mục mới

**Request Body:**

```json
{
  "name": "Món tráng miệng",
  "description": "Các món tráng miệng ngọt"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Created category successfully",
  "data": {
    "id": 2,
    "name": "Món tráng miệng",
    "description": "Các món tráng miệng ngọt"
  }
}
```

---

### 22. Get Category Detail

**Endpoint:** `GET /api/menu/categories/{id}/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Chi tiết danh mục + menu items

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Món chính",
    "description": "Các món ăn chính",
    "menu_items": [
      {
        "id": 1,
        "name": "Phở bò",
        "price": "80000.00",
        "status": "available"
      }
    ]
  }
}
```

---

### 23. Update Category

**Endpoint:** `PATCH /api/menu/categories/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật danh mục

**Request Body:**

```json
{
  "name": "Món chính (Updated)",
  "description": "Mô tả mới"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Updated category successfully",
  "data": {
    "id": 1,
    "name": "Món chính (Updated)",
    "description": "Mô tả mới"
  }
}
```

---

### 24. Delete Category

**Endpoint:** `DELETE /api/menu/categories/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Xóa danh mục (soft delete)

**Business Rules:**

- Không thể xóa danh mục có món ăn

**Response (200):**

```json
{
  "success": true,
  "message": "Deleted category successfully"
}
```

---

### 25. List Menu Items

**Endpoint:** `GET /api/menu/items/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Danh sách món ăn

**Query Parameters:**

- `name`: Lọc theo tên món
- `category_id`: Lọc theo danh mục
- `status`: Lọc theo trạng thái (available/unavailable)

**Example:** `GET /api/menu/items/?category_id=1&status=available`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": 1,
      "category_name": "Món chính",
      "name": "Phở bò",
      "description": "Phở bò truyền thống",
      "price": "80000.00",
      "image": "/media/menu_items/pho_bo.jpg",
      "status": "available",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 26. Create Menu Item

**Endpoint:** `POST /api/menu/items/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Tạo món ăn mới (có upload ảnh)

**Content-Type:** `multipart/form-data`

**Request Body:**

```
category: 1
name: Bún bò Huế
description: Bún bò Huế cay
price: 65000
status: available
image: <file>
```

**Response (201):**

```json
{
  "success": true,
  "message": "Created menu item successfully",
  "data": {
    "id": 2,
    "category": 1,
    "name": "Bún bò Huế",
    "price": "65000.00",
    "image": "/media/menu_items/bun_bo_hue.jpg",
    "status": "available"
  }
}
```

---

### 27. Get Menu Item Detail

**Endpoint:** `GET /api/menu/items/{id}/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Chi tiết món ăn

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": 1,
    "category_name": "Món chính",
    "name": "Phở bò",
    "description": "Phở bò truyền thống",
    "price": "80000.00",
    "image": "/media/menu_items/pho_bo.jpg",
    "status": "available",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 28. Update Menu Item

**Endpoint:** `PATCH /api/menu/items/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật món ăn (có upload ảnh)

**Content-Type:** `multipart/form-data`

**Request Body:**

```
name: Phở bò đặc biệt
price: 90000
image: <file>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Updated menu item successfully",
  "data": {
    "id": 1,
    "name": "Phở bò đặc biệt",
    "price": "90000.00",
    "image": "/media/menu_items/pho_bo_special.jpg"
  }
}
```

---

### 29. Delete Menu Item

**Endpoint:** `DELETE /api/menu/items/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Xóa món ăn (soft delete)

**Response (200):**

```json
{
  "success": true,
  "message": "Deleted menu item successfully"
}
```

---

### 30. Change Menu Item Status

**Endpoint:** `PATCH /api/menu/items/{id}/status/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Thay đổi trạng thái món ăn

**Request Body:**

```json
{
  "status": "unavailable"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Menu item status changed to unavailable",
  "data": {
    "id": 1,
    "name": "Phở bò",
    "status": "unavailable"
  }
}
```

---

### 31. Check Menu Item Status

**Endpoint:** `GET /api/menu/items/{id}/check-status/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Kiểm tra trạng thái menu item dựa trên ingredients

**Response (200):**

```json
{
  "success": true,
  "data": {
    "menu_item_id": 1,
    "menu_item_name": "Phở bò",
    "current_status": "available",
    "suggested_status": "unavailable",
    "can_be_made": false,
    "ingredients_status": [
      {
        "ingredient_name": "Thịt bò",
        "required": 0.5,
        "available": 0.2,
        "sufficient": false
      }
    ]
  }
}
```

---

### 32. Update All Menu Items Status

**Endpoint:** `POST /api/menu/items/update-all-status/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật trạng thái tất cả menu items dựa trên ingredients

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully updated 5 menu items",
  "updated_count": 5
}
```

---

### 33. List Recipes

**Endpoint:** `GET /api/menu/items/{menu_id}/recipes/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Danh sách nguyên liệu của món

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "menu_item": 1,
      "ingredient": 1,
      "ingredient_name": "Thịt bò",
      "ingredient_unit": "kg",
      "quantity_required": 0.5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 34. Add Recipe

**Endpoint:** `POST /api/menu/items/{menu_id}/recipes/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Thêm nguyên liệu vào món (có thể gửi mảng)

**Request Body (Single):**

```json
{
  "ingredient": 1,
  "quantity_required": 0.5
}
```

**Request Body (Multiple):**

```json
[
  {
    "ingredient": 1,
    "quantity_required": 0.5
  },
  {
    "ingredient": 2,
    "quantity_required": 0.3
  }
]
```

**Response (201):**

```json
{
  "success": true,
  "message": "Added ingredients to recipe successfully",
  "data": [
    {
      "id": 1,
      "ingredient": 1,
      "ingredient_name": "Thịt bò",
      "quantity_required": 0.5
    },
    {
      "id": 2,
      "ingredient": 2,
      "ingredient_name": "Bánh phở",
      "quantity_required": 0.3
    }
  ]
}
```

---

### 35. Bulk Update Recipes

**Endpoint:** `PATCH /api/menu/items/{menu_id}/recipes/bulk/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật hàng loạt nguyên liệu cho món ăn

**Request Body:**

```json
[
  {
    "ingredient": 1,
    "quantity_required": 0.6
  },
  {
    "ingredient": 3,
    "quantity_required": 0.2
  }
]
```

**Response (200):**

```json
{
  "success": true,
  "message": "Bulk updated recipe",
  "updated": [
    {
      "id": 1,
      "ingredient": 1,
      "quantity_required": 0.6
    }
  ],
  "added": [
    {
      "id": 5,
      "ingredient": 3,
      "quantity_required": 0.2
    }
  ],
  "removed": [2]
}
```

---

### 36. Update Recipe

**Endpoint:** `PATCH /api/menu/recipes/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật số lượng nguyên liệu

**Request Body:**

```json
{
  "quantity_required": 0.7
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Updated recipe successfully",
  "data": {
    "id": 1,
    "ingredient": 1,
    "quantity_required": 0.7
  }
}
```

---

### 37. Delete Recipe

**Endpoint:** `DELETE /api/menu/recipes/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Xóa nguyên liệu khỏi món (soft delete)

**Response (200):**

```json
{
  "success": true,
  "message": "Removed ingredient from recipe successfully"
}
```

---

## 📦 Order Management APIs

### 38. List Orders (History)

**Endpoint:** `GET /api/orders/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Lịch sử đơn hàng với payment info

**Query Parameters:**

- `table`: Lọc theo ID bàn
- `status`: Lọc theo trạng thái (unpaid/paid)
- `floor`: Lọc theo tầng
- `date_from`: Lọc từ ngày (YYYY-MM-DD)
- `date_to`: Lọc đến ngày (YYYY-MM-DD)
- `table_name`: Tìm kiếm theo tên bàn

**Ordering:** Oldest orders first (created_at ascending)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "table": 5,
      "table_name": "Bàn 5",
      "table_floor": 2,
      "user": 1,
      "user_name": "Nhân viên A",
      "status": "paid",
      "total_amount": "250000.00",
      "payment_info": {
        "payment_id": 8,
        "amount": "250000.00",
        "discount": "25000.00",
        "tax": "0.00",
        "final_amount": "250000.00",
        "method": "cash",
        "paid_at": "2024-01-15T15:30:00Z"
      },
      "table_info": {
        "table_id": 5,
        "table_name": "Bàn 5",
        "floor": 2,
        "status": "available"
      },
      "created_at": "2024-01-15T14:30:00Z",
      "closed_at": "2024-01-15T15:30:00Z"
    }
  ],
  "total": 1
}
```

---

### 39. Create Order

**Endpoint:** `POST /api/orders/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Tạo đơn hàng mới + thêm món

**Request Body:**

```json
{
  "table": 1,
  "items": [
    {
      "menu_item": 1,
      "quantity": 2,
      "note": "Ít cay"
    },
    {
      "menu_item": 2,
      "quantity": 1
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Created order successfully",
  "data": {
    "id": 16,
    "table": 1,
    "user": 1,
    "status": "unpaid",
    "order_items": [
      {
        "menu_item": 1,
        "menu_item_name": "Phở bò",
        "quantity": 2,
        "price_each": "80000.00",
        "status": "ordered"
      }
    ],
    "total_amount": "160000.00"
  }
}
```

---

### 40. Get Order Detail

**Endpoint:** `GET /api/orders/{id}/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Chi tiết đơn hàng với order_items gộp theo món+status

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "table": 5,
    "user": 1,
    "status": "unpaid",
    "order_items": [
      {
        "menu_item": 1,
        "menu_item_name": "Phở bò",
        "menu_item_price": "80000.00",
        "status": "done",
        "quantity": 5,
        "price_each": "80000.00",
        "subtotal": "400000.00"
      },
      {
        "menu_item": 1,
        "menu_item_name": "Phở bò",
        "menu_item_price": "80000.00",
        "status": "ordered",
        "quantity": 2,
        "price_each": "80000.00",
        "subtotal": "160000.00"
      }
    ],
    "total_amount": "560000.00",
    "items_count": 2
  }
}
```

---

### 41. Get Order By Table

**Endpoint:** `GET /api/orders/table/{table_id}/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Xem đơn hàng unpaid theo bàn

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "table": 5,
    "status": "unpaid",
    "order_items": [...],
    "total_amount": "250000.00"
  }
}
```

**Response (No Order):**

```json
{
  "success": true,
  "message": "No unpaid order found for this table",
  "data": null
}
```

---

### 42. Bulk Update Order Items

**Endpoint:** `PATCH /api/orders/{order_id}/items/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Quản lý món trong đơn hàng (thêm/sửa/xóa)

**Logic:**

- Món đã có + status ordered: cập nhật số lượng
- Món không có trong mảng + status ordered/cancelled: xóa
- Món không có trong mảng + status cooking/done: không xóa, báo lỗi
- Món mới: thêm với status ordered
- Món đã có + status cooking/done: tạo record mới với status ordered

**Request Body:**

```json
[
  {
    "menu_item": 1,
    "quantity": 3,
    "note": "Ít cay"
  },
  {
    "menu_item": 2,
    "quantity": 2
  }
]
```

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully updated order items",
  "updated": [
    {
      "id": 10,
      "menu_item": 1,
      "quantity": 3,
      "status": "ordered"
    }
  ],
  "added": [
    {
      "id": 11,
      "menu_item": 2,
      "quantity": 2,
      "status": "ordered"
    }
  ],
  "removed": [
    {
      "menu_item_id": 3,
      "menu_item_name": "Cơm gà",
      "quantity": 1,
      "status": "ordered"
    }
  ],
  "errors": [
    {
      "menu_item_id": 4,
      "menu_item_name": "Bún bò",
      "status": "cooking",
      "message": "Cannot remove item \"Bún bò\" with status \"cooking\""
    }
  ]
}
```

---

### 43. Update Order Item Status

**Endpoint:** `PATCH /api/orders/items/{id}/status/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Cập nhật trạng thái món

**Status Transitions:**

- ✅ ordered → cooking
- ✅ cooking → done
- ✅ done → served
- ✅ ordered/cooking → cancelled
- ❌ served → cancelled
- ❌ cooking → ordered
- ❌ done → cooking

**Request Body:**

```json
{
  "status": "cooking"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Updated order item status from \"ordered\" to \"cooking\"",
  "data": {
    "id": 10,
    "menu_item": 1,
    "quantity": 2,
    "status": "cooking"
  }
}
```

**Response (400 - Invalid Transition):**

```json
{
  "success": false,
  "message": "Cannot change to \"cooking\" from \"done\". Only items with status \"ordered\" can be changed to \"cooking\"."
}
```

**Response (400 - Ingredient Shortage):**

```json
{
  "success": false,
  "message": "Không thể cập nhật trạng thái món",
  "error": "Không đủ nguyên liệu: Thịt bò (cần 0.5kg, còn 0.2kg)",
  "error_type": "ingredient_shortage"
}
```

---

### 44. Delete Order Item

**Endpoint:** `DELETE /api/orders/items/{id}/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Xóa order item

**Business Rules:**

- Chỉ cho phép xóa items có status "ordered" hoặc "cancelled"
- Không thể xóa items có status "cooking" hoặc "done"

**Response (200):**

```json
{
  "success": true,
  "message": "Order item deleted successfully",
  "deleted_item": {
    "id": 10,
    "menu_item_name": "Phở bò",
    "quantity": 2,
    "status": "ordered",
    "order_id": 15
  }
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Cannot delete item with status \"cooking\". Only items with status \"ordered\" or \"cancelled\" can be deleted."
}
```

---

### 45. Create Payment

**Endpoint:** `POST /api/orders/{order_id}/payments/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Tạo thanh toán + đóng đơn tự động

**Calculation:**

- `amount = total_amount - discount - tax`
- `final_amount = amount`

**Request Body:**

```json
{
  "amount": 150000,
  "discount": 15000,
  "tax": 0,
  "method": "cash"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Payment created and order closed successfully",
  "data": {
    "id": 1,
    "order": 15,
    "amount": "150000.00",
    "discount": "15000.00",
    "tax": "0.00",
    "method": "cash",
    "created_at": "2024-01-15T15:30:00Z"
  },
  "calculation": {
    "total_amount": 165000.0,
    "discount": 15000.0,
    "tax": 0.0,
    "final_amount": 150000.0
  }
}
```

---

### 46. Order Statistics

**Endpoint:** `GET /api/orders/stats/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Thống kê đơn hàng

**Response (200):**

```json
{
  "success": true,
  "message": "Retrieved order statistics successfully",
  "data": {
    "total_orders": 150,
    "unpaid_orders": 8,
    "paid_orders": 142,
    "today_orders": 25,
    "today_revenue": 3500000.0
  }
}
```

---

## 📦 Inventory Management APIs

### 47. List Warehouse

**Endpoint:** `GET /api/inventory/warehouse/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Danh sách nguyên liệu trong kho

**Query Parameters:**

- `name`: Lọc theo tên nguyên liệu
- `status`: Lọc theo trạng thái (active/inactive)
- `low_stock`: Lọc nguyên liệu sắp hết (true)

**Example:** `GET /api/inventory/warehouse/?low_stock=true`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Thịt bò",
      "unit": "kg",
      "stock_quantity": 5.5,
      "min_quantity": 10.0,
      "price_per_unit": "250000.00",
      "status": "active",
      "is_low_stock": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "summary": {
    "total_ingredients": 1,
    "low_stock_items": 1
  }
}
```

---

### 48. Update Warehouse Item

**Endpoint:** `PATCH /api/inventory/warehouse/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Cập nhật tên, đơn vị và ngưỡng tối thiểu nguyên liệu

**Request Body:**

```json
{
  "name": "Thịt bò Úc",
  "unit": "kg",
  "min_quantity": 15.0
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Cập nhật thông tin nguyên liệu thành công",
  "data": {
    "id": 1,
    "name": "Thịt bò Úc",
    "unit": "kg",
    "min_quantity": 15.0
  }
}
```

---

### 49. List Stock-In

**Endpoint:** `GET /api/inventory/stock-in/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Danh sách lịch sử nhập kho

**Query Parameters:**

- `ingredient_name`: Lọc theo tên nguyên liệu
- `date_from`: Lọc từ ngày (YYYY-MM-DD)
- `date_to`: Lọc đến ngày (YYYY-MM-DD)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ingredient": 1,
      "ingredient_name": "Thịt bò",
      "ingredient_unit": "kg",
      "quantity": 20.0,
      "price": "5000000.00",
      "user": 1,
      "user_name": "Admin",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "summary": {
    "total_records": 1
  }
}
```

---

### 50. Create Stock-In

**Endpoint:** `POST /api/inventory/stock-in/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Nhập kho mới - Tự động tạo/cập nhật nguyên liệu

**Request Body:**

```json
{
  "ingredient_name": "Thịt bò",
  "ingredient_unit": "kg",
  "min_quantity": 10.0,
  "quantity": 20.0,
  "price": 5000000
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Stock-in success - Create ingredient",
  "data": {
    "id": 1,
    "ingredient": 1,
    "ingredient_name": "Thịt bò",
    "quantity": 20.0,
    "price": "5000000.00"
  },
  "ingredient_update": {
    "ingredient_name": "Thịt bò",
    "previous_quantity": 0.0,
    "incoming_quantity": 20.0,
    "new_quantity": 20.0,
    "is_new_ingredient": true
  }
}
```

---

### 51. Get Stock-In Detail

**Endpoint:** `GET /api/inventory/stock-in/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Chi tiết phiếu nhập kho

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ingredient": 1,
    "ingredient_name": "Thịt bò",
    "quantity": 20.0,
    "price": "5000000.00",
    "user": 1,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### 52. List Stock-Out

**Endpoint:** `GET /api/inventory/stock-out/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Danh sách lịch sử xuất kho

**Query Parameters:**

- `ingredient_name`: Lọc theo tên nguyên liệu
- `reason`: Lọc theo lý do (damaged/expired/other/used)
- `date_from`: Lọc từ ngày (YYYY-MM-DD)
- `date_to`: Lọc đến ngày (YYYY-MM-DD)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ingredient": 1,
      "ingredient_name": "Thịt bò",
      "quantity": 0.5,
      "reason": "used",
      "notes": "Dùng cho đơn #15",
      "order_item": 20,
      "user": 1,
      "user_name": "Staff01",
      "created_at": "2024-01-15T14:30:00Z"
    }
  ],
  "summary": {
    "total_records": 1
  }
}
```

---

### 53. Create Stock-Out

**Endpoint:** `POST /api/inventory/stock-out/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Xuất kho thủ công - Tự động cập nhật tồn kho

**Request Body:**

```json
{
  "ingredient_name": "Thịt bò",
  "quantity": 2.0,
  "reason": "damaged",
  "notes": "Thịt hỏng do mất điện tủ lạnh"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Stock-out successfully",
  "data": {
    "id": 2,
    "ingredient": 1,
    "ingredient_name": "Thịt bò",
    "quantity": 2.0,
    "reason": "damaged",
    "notes": "Thịt hỏng do mất điện tủ lạnh"
  },
  "ingredient_update": {
    "ingredient_name": "Thịt bò",
    "previous_quantity": 20.0,
    "outgoing_quantity": 2.0,
    "new_quantity": 18.0,
    "status_changed": false
  }
}
```

**Response (400 - Not Enough Stock):**

```json
{
  "success": false,
  "message": "Not enough stock. Current: 5.0, Required: 10.0"
}
```

---

### 54. Get Stock-Out Detail

**Endpoint:** `GET /api/inventory/stock-out/{id}/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Chi tiết phiếu xuất kho

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "ingredient": 1,
    "ingredient_name": "Thịt bò",
    "quantity": 0.5,
    "reason": "used",
    "notes": "Dùng cho đơn #15",
    "created_at": "2024-01-15T14:30:00Z"
  }
}
```

---

## 📊 Dashboard APIs

### 55. Admin Dashboard Stats

**Endpoint:** `GET /api/dashboard/stats/`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Thống kê tổng quan cho admin

**Response (200):**

```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 150,
      "today": 25,
      "unpaid": 8,
      "paid": 142,
      "change_percent": 15.5
    },
    "revenue": {
      "total": 45000000.0,
      "today": 3500000.0,
      "this_month": 12000000.0,
      "change_percent": 20.3
    },
    "tables": {
      "total": 20,
      "available": 15,
      "unavailable": 5
    },
    "menu": {
      "total": 50,
      "available": 45,
      "unavailable": 5,
      "categories": 8
    },
    "ingredients": {
      "total": 30,
      "low_stock": 5
    }
  }
}
```

---

### 56. Recent Orders

**Endpoint:** `GET /api/dashboard/recent-orders/?limit=10`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Lấy đơn hàng gần đây

**Query Parameters:**

- `limit`: Số lượng đơn hàng (default: 10)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "table": {
        "id": 5,
        "name": "Bàn 5"
      },
      "status": "unpaid",
      "created_at": "2024-01-15T14:30:00Z",
      "total_amount": 250000.0,
      "items_count": 3
    }
  ]
}
```

---

### 57. Top Menu Items

**Endpoint:** `GET /api/dashboard/top-items/?limit=10&days=30`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Món ăn bán chạy

**Query Parameters:**

- `limit`: Số lượng món (default: 10)
- `days`: Số ngày thống kê (default: 30)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Phở bò",
      "total_quantity": 150,
      "total_revenue": 12000000.0
    }
  ]
}
```

---

### 58. Revenue By Day

**Endpoint:** `GET /api/dashboard/revenue-by-day/?days=7`  
**Permission:** IsAuthenticated + IsAdminUser  
**Description:** Doanh thu theo ngày

**Query Parameters:**

- `days`: Số ngày thống kê (default: 7)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "revenue": 3500000.0,
      "orders_count": 25
    },
    {
      "date": "2024-01-16",
      "revenue": 4200000.0,
      "orders_count": 30
    }
  ]
}
```

---

### 59. Staff Dashboard Stats

**Endpoint:** `GET /api/dashboard/staff/stats/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Thống kê cho staff

**Response (200):**

```json
{
  "success": true,
  "data": {
    "tables": {
      "total": 20,
      "occupied": 5,
      "available": 15
    },
    "orders": {
      "today": 25,
      "pending": 8
    },
    "revenue": {
      "today": 3500000.0
    },
    "alerts": {
      "low_stock_count": 5
    }
  }
}
```

---

### 60. Staff Active Orders

**Endpoint:** `GET /api/dashboard/staff/active-orders/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Đơn hàng đang hoạt động cho staff

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "table": {
        "id": 5,
        "name": "Bàn 5"
      },
      "status": "unpaid",
      "created_at": "2024-01-15T14:30:00Z",
      "waiting_minutes": 25,
      "total_amount": 250000.0,
      "items_count": 3,
      "items": [
        {
          "menu_item_name": "Phở bò",
          "quantity": 2,
          "price": 80000.0,
          "status": "cooking"
        }
      ],
      "staff_name": "staff01"
    }
  ]
}
```

---

### 61. Staff Alerts

**Endpoint:** `GET /api/dashboard/staff/alerts/`  
**Permission:** IsAuthenticated (Staff + Admin)  
**Description:** Cảnh báo cho staff

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "type": "warning",
      "icon": "clock",
      "message": "Bàn 5 chờ quá 25 phút",
      "order_id": 15
    },
    {
      "type": "danger",
      "icon": "exclamation-triangle",
      "message": "Thịt bò sắp hết (còn 5.0 kg)",
      "ingredient_name": "Thịt bò"
    },
    {
      "type": "info",
      "icon": "info-circle",
      "message": "Có 5 món ăn không khả dụng",
      "count": 5
    }
  ]
}
```

---

## 📌 Common Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Operation failed",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Authentication Error (401)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Error (403)

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## 🔑 Authentication Headers

All authenticated endpoints require JWT token:

```
Authorization: Bearer <access_token>
```

---

## 📝 Notes

1. **Soft Delete:** Hầu hết các resource sử dụng soft delete (deleted_at field)
2. **Timestamps:** Tất cả timestamps trả về ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
3. **Decimal Fields:** Giá tiền và số lượng được trả về dạng string để tránh mất độ chính xác
4. **Filtering:** Hỗ trợ filtering thông qua query parameters
5. **Ordering:** List endpoints có thể có default ordering
6. **Pagination:** Chưa implement, sẽ được thêm trong tương lai

---

## 🎯 Permission Summary

- **AllowAny:** Login
- **IsAuthenticated (Staff + Admin):** Tables, Menu (view), Orders, Dashboard (staff)
- **IsAuthenticated + IsAdminUser:** Users, Menu (create/update/delete), Inventory, Dashboard (admin)

---

**Last Updated:** November 11, 2025  
**API Version:** 1.0.0  
**Base URL:** `http://127.0.0.1:8000/api/`
