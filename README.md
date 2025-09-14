# Restaurant Management System

Hệ thống quản lý nhà hàng toàn diện với Django REST API backend và React TypeScript frontend.

## 🏗️ Cấu trúc dự án

```
RestaurantManagement/
├── backend/                 # Django REST API
│   ├── core/               # Settings và cấu hình chính
│   ├── accounts/           # Quản lý người dùng
│   ├── tables/             # Quản lý bàn ăn
│   ├── menu/               # Danh mục và món ăn
│   ├── orders/             # Đơn hàng và thanh toán
│   ├── inventory/          # Quản lý kho
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Docker config cho backend
│   └── entrypoint.sh      # Auto-setup script
├── frontend/               # React TypeScript App
│   ├── src/               # Source code
│   ├── public/            # Static files
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Docker config cho frontend
├── docker-compose.yml      # Docker orchestration
├── .gitignore             # Git ignore rules
└── README.md
```

## 🛠️ Yêu cầu hệ thống

### Docker Setup (Khuyến nghị)

- **Docker:** Version 20.0+
- **Docker Compose:** Version 2.0+

### Manual Setup

- **Python:** 3.11+
- **Node.js:** 20+ (Vite yêu cầu Node 20+)
- **PostgreSQL:** 15+

## 🚀 Cài đặt và chạy

### 🐳 Sử dụng Docker (Khuyến nghị)

#### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd RestaurantManagement
```

#### Bước 2: Build và chạy tất cả services

```bash
# Build và chạy ở chế độ background
docker-compose up --build -d

# Hoặc chạy ở chế độ foreground để xem logs
docker-compose up --build
```

#### Bước 3: Kiểm tra trạng thái

```bash
# Xem trạng thái containers
docker-compose ps

# Xem logs
docker-compose logs backend
docker-compose logs frontend
```

#### Bước 4: Dừng services

```bash
# Dừng containers
docker-compose down

# Dừng và xóa volumes (reset hoàn toàn)
docker-compose down -v
```

### 🔧 Chạy thủ công (Development)

#### Backend Setup

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Thiết lập database (PostgreSQL phải chạy trước)
python manage.py makemigrations
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Chạy server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công, các services sẽ có sẵn tại:

| Service         | URL                         | Mô tả                      |
| --------------- | --------------------------- | -------------------------- |
| **Frontend**    | http://localhost:3000       | Giao diện người dùng React |
| **Backend API** | http://localhost:8000       | Django REST API            |
| **Admin Panel** | http://localhost:8000/admin | Django Admin Interface     |
| **API Docs**    | http://localhost:8000/api/  | API Documentation          |
| **PostgreSQL**  | localhost:5432              | Database (chỉ với Docker)  |

### 🔐 Tài khoản mặc định

**Admin Account (tự động tạo với Docker):**

- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`

## 🗄️ Cấu hình Database

### Docker PostgreSQL

- **Host:** localhost
- **Port:** 5432
- **Database:** restaurant
- **Username:** postgres
- **Password:** 12345

### Kết nối pgAdmin

1. Mở pgAdmin desktop
2. Create Server với thông tin:
   - Host: `localhost`
   - Port: `5432`
   - Database: `postgres` (maintenance DB)
   - Username: `postgres`
   - Password: `12345`
3. Sau khi kết nối, expand Databases → restaurant để xem tables

## ✨ Tính năng

### 👨‍🍳 Nhân viên phục vụ (Staff)

- ✅ Quản lý bàn ăn (mở bàn, đóng bàn, chuyển bàn)
- ✅ Tạo và chỉnh sửa đơn hàng
- ✅ Theo dõi trạng thái món ăn
- ✅ Xử lý thanh toán
- ✅ In hóa đơn

### 👨‍💼 Quản trị viên (Admin)

- ✅ Tất cả quyền của nhân viên
- ✅ CRUD menu và danh mục món ăn
- ✅ Quản lý tài khoản nhân viên
- ✅ Báo cáo doanh thu và thống kê
- ✅ Quản lý kho và nguyên liệu
- ✅ Theo dõi tồn kho và cảnh báo hết hàng

## 🗃️ Database Schema

Hệ thống sử dụng PostgreSQL với **21 bảng** được tổ chức theo modules:

### 👥 User Management

- `users` - Tài khoản người dùng (admin/staff)
- `users_groups` - Nhóm quyền
- `users_user_permissions` - Quyền chi tiết

### 🍽️ Restaurant Operations

- `categories` - Danh mục món ăn
- `menu_items` - Món ăn (giá, mô tả, hình ảnh)
- `tables` - Bàn ăn và trạng thái

### 📝 Order Management

- `orders` - Đơn hàng
- `orders_items` - Chi tiết món trong đơn
- `payments` - Thanh toán

### 📦 Inventory Management

- `ingredients` - Nguyên liệu
- `storages` - Kho với cảnh báo tồn kho
- `stock_in` - Phiếu nhập kho
- `stock_out` - Phiếu xuất kho
- `recipes` - Công thức món ăn

## 🔧 Development

### Thêm tính năng mới

1. **Backend:** Tạo app Django mới trong `/backend`
2. **Frontend:** Thêm components trong `/frontend/src`
3. **Database:** Tạo migrations với `python manage.py makemigrations`

### Debugging

```bash
# Xem logs containers
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Truy cập container
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d restaurant

# Restart service
docker-compose restart backend
```

### Testing

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests
docker-compose exec frontend npm test
```

## 📋 Todo List

- [ ] Implement authentication JWT
- [ ] Add real-time order notifications
- [ ] Create mobile-responsive design
- [ ] Add inventory alerts
- [ ] Implement reporting dashboard
- [ ] Add multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Container không start

```bash
docker-compose down -v
docker-compose up --build
```

### Database connection lỗi

```bash
# Kiểm tra PostgreSQL container
docker-compose logs postgres
# Reset database
docker-compose down -v
```

### Port conflicts

Đổi ports trong `docker-compose.yml` nếu bị conflict:

```yaml
ports:
  - "8001:8000" # Backend
  - "3001:5173" # Frontend
  - "5433:5432" # PostgreSQL
```
