# Restaurant Management System

Hệ thống quản lý nhà hàng với Django REST API backend và React TypeScript frontend.

## 🛠️ Yêu cầu hệ thống

- **Python:** 3.11+
- **Node.js:** 20+
- **PostgreSQL:** 15+

## 🚀 Cài đặt và chạy

### 1. Clone dự án

```bash
git clone <repository-url>
cd RestaurantManagement
```

### 2. Setup Database (PostgreSQL)

Cài đặt PostgreSQL và tạo database:

**Windows (sử dụng pgAdmin hoặc psql):**

```sql
CREATE DATABASE restaurant;
CREATE USER postgres WITH PASSWORD '12345';
GRANT ALL PRIVILEGES ON DATABASE restaurant TO postgres;
```

**Hoặc sử dụng psql command line:**

```bash
psql -U postgres
CREATE DATABASE restaurant;
\q
```

### 3. Setup Backend

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

# Tạo .env file (đã tạo ở trên)

# Chạy migrations
python manage.py makemigrations accounts
python manage.py makemigrations tables
python manage.py makemigrations menu
python manage.py makemigrations orders
python manage.py makemigrations inventory
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Chạy server
python manage.py runserver
```

### 4. Setup Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 🌐 Truy cập ứng dụng

| Service         | URL                         |
| --------------- | --------------------------- |
| **Frontend**    | http://localhost:3000       |
| **Backend API** | http://localhost:8000       |
| **Admin Panel** | http://localhost:8000/admin |

## 🗄️ Database Config

Đảm bảo PostgreSQL đang chạy với cấu hình:

- **Host:** localhost
- **Port:** 5432
- **Database:** restaurant
- **Username:** postgres
- **Password:** ....

## 🔧 Development Scripts

### Backend

```bash
# Chạy server
python manage.py runserver

# Tạo migrations
python manage.py makemigrations

# Chạy migrations
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Chạy tests
python manage.py test
```

### Frontend

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### Database Connection Error

1. Kiểm tra PostgreSQL service đang chạy
2. Kiểm tra thông tin database trong backend/.env
3. Tạo database nếu chưa có

### Port Conflicts

Thay đổi ports nếu bị conflict:

**Backend:** Thay đổi port trong `python manage.py runserver 8001`

**Frontend:** Thay đổi port trong vite.config.ts:

```typescript
export default defineConfig({
  server: {
    port: 3001,
  },
});
```

### Module Import Errors

```bash
# Backend - reinstall dependencies
pip install -r requirements.txt

# Frontend - reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Quick Start

**Terminal 1 - Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Terminal 3 - Database:**
Đảm bảo PostgreSQL đang chạy và đã tạo database `restaurant`.

## 🎯 Next Steps

Sau khi setup thành công, bạn có thể:

1. Truy cập http://localhost:3000 để xem frontend
2. Truy cập http://localhost:8000/admin để quản lý backend
3. Bắt đầu phát triển các tính năng
4. Khi ổn định, có thể quay lại sử dụng Docker


##Tuyền test 
