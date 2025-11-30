# BÁO CÁO NGHIỆP VỤ HỆ THỐNG QUẢN LÝ NHÀ HÀNG

**Tên dự án:** Restaurant Management System  
**Phiên bản:** 1.0.0  
**Ngày:** 30/11/2025  
**Công nghệ:** Django REST Framework (Backend) + React TypeScript (Frontend)

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Phân quyền người dùng](#2-phân-quyền-người-dùng)
3. [Nghiệp vụ Admin](#3-nghiệp-vụ-admin)
4. [Nghiệp vụ Staff](#4-nghiệp-vụ-staff)
5. [Quy trình nghiệp vụ chính](#5-quy-trình-nghiệp-vụ-chính)
6. [Báo cáo và thống kê](#6-báo-cáo-và-thống-kê)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mục đích

Hệ thống quản lý nhà hàng được xây dựng để:

- Quản lý bàn, thực đơn, nguyên liệu, đơn hàng
- Tự động tính toán doanh thu, tồn kho
- Hỗ trợ thanh toán đa phương thức (Tiền mặt, MoMo)
- Cung cấp báo cáo thống kê theo thời gian thực

### 1.2. Đối tượng sử dụng

| Vai trò   | Mô tả                       | Quyền hạn                       |
| --------- | --------------------------- | ------------------------------- |
| **Admin** | Quản trị viên, chủ nhà hàng | Toàn quyền quản lý hệ thống     |
| **Staff** | Nhân viên phục vụ           | Quản lý bàn, đơn hàng, xem menu |

### 1.3. Các module chính

1. **Accounts** - Quản lý tài khoản người dùng
2. **Tables** - Quản lý bàn ăn
3. **Menu** - Quản lý thực đơn và công thức món ăn
4. **Orders** - Quản lý đơn hàng và thanh toán
5. **Inventory** - Quản lý kho nguyên liệu
6. **Dashboard** - Báo cáo thống kê

---

## 2. PHÂN QUYỀN NGƯỜI DÙNG

### 2.1. Phân quyền theo vai trò

#### 🔴 Admin (Toàn quyền)

**Có thể:**

- ✅ Tất cả quyền của Staff
- ✅ Quản lý tài khoản (tạo, sửa, xóa user)
- ✅ Quản lý thực đơn (tạo, sửa, xóa món ăn, danh mục)
- ✅ Quản lý công thức món ăn (thêm/xóa nguyên liệu)
- ✅ Quản lý kho (nhập/xuất nguyên liệu)
- ✅ Xem báo cáo tổng quan (doanh thu, thống kê toàn hệ thống)
- ✅ Xem lịch sử đơn hàng toàn bộ
- ✅ Xem hiệu suất làm việc của tất cả nhân viên

**Không thể:**

- ❌ Xóa chính mình
- ❌ Xóa bàn đang có khách (status = unavailable)
- ❌ Xóa danh mục có món ăn

#### 🟢 Staff (Hạn chế)

**Có thể:**

- ✅ Quản lý bàn (xem, đổi trạng thái, chuyển bàn)
- ✅ Xem thực đơn (chỉ xem, không được tạo/sửa/xóa)
- ✅ Tạo đơn hàng cho bàn
- ✅ Thêm/sửa/xóa món trong đơn hàng
- ✅ Cập nhật trạng thái món ăn (ordered → cooking → done → served)
- ✅ Thanh toán đơn hàng (tiền mặt, MoMo)
- ✅ Xem nguyên liệu còn trong kho (chỉ xem)
- ✅ Xem dashboard nhân viên (thống kê cá nhân)
- ✅ Xem hiệu suất làm việc của chính mình

**Không thể:**

- ❌ Quản lý tài khoản user
- ❌ Tạo/sửa/xóa món ăn, danh mục
- ❌ Nhập/xuất kho nguyên liệu
- ❌ Xem báo cáo tổng quan toàn hệ thống
- ❌ Xem hiệu suất của nhân viên khác

### 2.2. Xác thực và phân quyền

**Authentication:**

- Sử dụng JWT (JSON Web Token)
- Access token có thời hạn ngắn
- Refresh token để gia hạn session

**Authorization:**

- Mỗi API endpoint kiểm tra quyền trước khi xử lý
- Permission classes: `IsAuthenticated`, `IsAdminUser`, `IsOwnerOrAdmin`

---

## 3. NGHIỆP VỤ ADMIN

### 3.1. Quản lý tài khoản người dùng

#### 3.1.1. Xem danh sách user

**Chức năng:**

- Xem tất cả user trong hệ thống
- Lọc theo: tên, username, role, trạng thái hoạt động
- Phân biệt màu sắc: Admin (đỏ), Staff (xanh)

**Business Rules:**

- Hiển thị đầy đủ: ID, Username, Tên, Role, Trạng thái
- User bị xóa (soft delete) không hiển thị

#### 3.1.2. Tạo user mới

**Input:**

- Username (unique)
- Name
- Password
- Role (admin/staff)

**Business Rules:**

- Username không được trùng
- User mới tạo có is_active = False (chưa đăng nhập lần đầu)
- Password được hash tự động

#### 3.1.3. Cập nhật user

**Có thể cập nhật:**

- Name
- Username
- Password
- Role

**Business Rules:**

- Admin không thể tự giảm role của chính mình
- Không thể cập nhật user đã bị xóa

#### 3.1.4. Xóa user

**Business Rules:**

- ❌ Không được xóa chính mình
- ❌ Phải tồn tại ít nhất 1 admin trong hệ thống
- Soft delete (set deleted_at)

**Error Messages:**

```
"Cannot delete yourself"
"Cannot delete the last admin user"
```

---

### 3.2. Quản lý thực đơn

#### 3.2.1. Quản lý danh mục món ăn

**Chức năng:**

- Tạo/Sửa/Xóa danh mục (Category)
- Xem danh sách món ăn trong danh mục

**Business Rules:**

- Tên danh mục unique
- Không thể xóa danh mục có món ăn
- Soft delete

**Ví dụ danh mục:**

- Món chính
- Món khai vị
- Món tráng miệng
- Đồ uống
- Món ăn chay

#### 3.2.2. Quản lý món ăn

**Chức năng:**

- Tạo món ăn mới (có upload ảnh)
- Cập nhật thông tin món ăn
- Đổi trạng thái (available/unavailable)
- Xóa món ăn

**Thông tin món ăn:**

- Tên món
- Mô tả
- Giá
- Danh mục
- Ảnh
- Trạng thái (available/unavailable)

**Business Rules:**

- Món ăn available thì mới hiển thị cho staff đặt
- Có thể set unavailable thủ công hoặc tự động (khi thiếu nguyên liệu)
- Soft delete

#### 3.2.3. Quản lý công thức món ăn (Recipe)

**Chức năng:**

- Thêm nguyên liệu vào món ăn
- Cập nhật số lượng nguyên liệu cần dùng
- Xóa nguyên liệu khỏi món

**Business Rules:**

- Một món ăn có nhiều nguyên liệu
- Mỗi nguyên liệu có quantity_required (số lượng cần)
- Khi xuất món (cooking → done), hệ thống tự động trừ kho

**Ví dụ:**

```
Món: Phở bò
- Thịt bò: 0.5 kg
- Bánh phở: 0.3 kg
- Hành lá: 0.05 kg
```

#### 3.2.4. Tự động cập nhật trạng thái món ăn

**Chức năng:**

- Button "Cập nhật trạng thái tất cả món"
- Kiểm tra tồn kho từng món
- Set unavailable nếu thiếu nguyên liệu

**Logic:**

```python
for menu_item in all_menu_items:
    if not enough_ingredients:
        menu_item.status = 'unavailable'
```

---

### 3.3. Quản lý kho nguyên liệu

#### 3.3.1. Xem tồn kho (Warehouse)

**Hiển thị:**

- Tên nguyên liệu
- Đơn vị (kg, lít, gói, ...)
- Số lượng tồn kho hiện tại
- Ngưỡng tối thiểu (min_quantity)
- Giá nhập trung bình
- Trạng thái (active/inactive)

**Cảnh báo:**

- 🔴 Đỏ: Sắp hết (stock_quantity < min_quantity)
- 🟢 Xanh: Đủ hàng

**Business Rules:**

- Mỗi nguyên liệu có min_quantity để cảnh báo
- Nguyên liệu inactive không hiển thị khi tạo món

#### 3.3.2. Nhập kho (Stock-In)

**Input:**

- Tên nguyên liệu (nếu chưa có thì tạo mới)
- Đơn vị
- Số lượng nhập
- Giá nhập
- Ngưỡng tối thiểu

**Business Rules:**

- Tự động tạo Ingredient nếu chưa tồn tại
- Cập nhật stock_quantity: `old + incoming`
- Tự động set status = 'active' nếu đủ hàng
- Lưu lịch sử nhập kho (StockIn table)

**Output:**

```json
{
  "message": "Stock-in success - Create ingredient",
  "ingredient_update": {
    "previous_quantity": 0,
    "incoming_quantity": 20,
    "new_quantity": 20,
    "is_new_ingredient": true
  }
}
```

#### 3.3.3. Xuất kho (Stock-Out)

**Input:**

- Tên nguyên liệu
- Số lượng xuất
- Lý do (damaged/expired/other/used)
- Ghi chú

**Business Rules:**

- Kiểm tra tồn kho đủ hay không
- Cập nhật stock_quantity: `old - outgoing`
- Set status = 'inactive' nếu < min_quantity
- Lưu lịch sử xuất kho (StockOut table)

**Lý do xuất kho:**

- `damaged`: Hỏng
- `expired`: Hết hạn
- `other`: Khác
- `used`: Dùng cho món ăn (tự động khi cooking → done)

**Xuất kho tự động:**

- Khi OrderItem chuyển từ `cooking` → `done`
- Signal tự động tạo StockOut với reason='used'
- Trừ nguyên liệu theo Recipe

---

### 3.4. Quản lý bàn

**Chức năng:**

- Tạo/Sửa/Xóa bàn
- Xem trạng thái bàn theo tầng
- Chuyển bàn cho khách

**Thông tin bàn:**

- Tên bàn (Bàn 1, Bàn VIP 01, ...)
- Tầng (1, 2, 3, ...)
- Trạng thái (available/unavailable)

**Business Rules:**

- Bàn available: Trống
- Bàn unavailable: Có khách
- Không thể xóa bàn đang có khách
- Soft delete

---

### 3.5. Quản lý đơn hàng

#### 3.5.1. Xem lịch sử đơn hàng

**Chức năng:**

- Xem tất cả đơn hàng (paid + unpaid)
- Lọc theo: bàn, trạng thái, tầng, ngày
- Xem chi tiết thanh toán

**Hiển thị:**

- ID đơn hàng
- Bàn
- Nhân viên tạo
- Tổng tiền
- Trạng thái (paid/unpaid)
- Thông tin thanh toán (nếu có)
- Thời gian tạo/đóng

**Business Rules:**

- Sắp xếp: Oldest first (created_at ascending)
- Hiển thị cả paid và unpaid

#### 3.5.2. Xem chi tiết đơn hàng

**Hiển thị:**

- Thông tin bàn
- Danh sách món (gộp theo món + status)
- Tổng tiền
- Thông tin thanh toán

**Gộp món:**

```
Phở bò (done) x5 = 400,000đ
Phở bò (ordered) x2 = 160,000đ
```

---

### 3.6. Dashboard Admin

#### 3.6.1. Thống kê tổng quan

**Hiển thị:**

**1. Đơn hàng:**

- Tổng đơn hàng
- Đơn hàng hôm nay
- Đơn chưa thanh toán
- Đơn đã thanh toán
- % thay đổi so với hôm qua

**2. Doanh thu:**

- Tổng doanh thu
- Doanh thu hôm nay
- Doanh thu tháng này
- % thay đổi so với hôm qua

**3. Bàn:**

- Tổng số bàn
- Bàn trống
- Bàn có khách

**4. Thực đơn:**

- Tổng món ăn
- Món available
- Món unavailable
- Số danh mục

**5. Nguyên liệu:**

- Tổng nguyên liệu
- Nguyên liệu sắp hết

#### 3.6.2. Đơn hàng gần đây

**Hiển thị:**

- 10 đơn hàng mới nhất
- Thông tin: Bàn, Tổng tiền, Trạng thái, Thời gian

#### 3.6.3. Top món bán chạy

**Hiển thị:**

- 10 món bán chạy nhất
- Số lượng bán
- Doanh thu từ món

**Tham số:**

- `limit`: Số lượng món (default: 10)
- `days`: Số ngày thống kê (default: 30)

#### 3.6.4. Doanh thu theo ngày

**Hiển thị:**

- Biểu đồ doanh thu 7 ngày gần nhất
- Tổng doanh thu mỗi ngày

#### 3.6.5. Insights nâng cao

**1. Món đắt nhất:**

- Top 10 món giá cao nhất
- Tần suất bán

**2. Lịch sử đơn hàng:**

- Số đơn hàng trong tháng
- Tổng doanh thu tháng
- Trung bình đơn hàng/ngày

**3. Giờ cao điểm:**

- Phân tích đơn hàng theo giờ
- Xác định giờ cao điểm

**4. Hiệu suất nhân viên:**

- Xếp hạng nhân viên theo số đơn
- Tổng doanh thu từng nhân viên
- Top 10 nhân viên

---

## 4. NGHIỆP VỤ STAFF

### 4.1. Quản lý bàn

#### 4.1.1. Xem danh sách bàn

**Hiển thị:**

- Lưới bàn theo tầng
- Màu sắc: 🟢 Trống, 🔴 Có khách
- Click vào bàn → Xem chi tiết/Tạo đơn

**Lọc:**

- Theo tầng
- Theo trạng thái

#### 4.1.2. Tạo đơn hàng cho bàn

**Flow:**

1. Click vào bàn trống
2. Chọn món từ menu
3. Nhập số lượng, ghi chú
4. Submit → Tạo đơn hàng
5. Bàn chuyển sang status unavailable

**Business Rules:**

- Chỉ tạo được đơn cho bàn trống
- Một bàn chỉ có 1 đơn unpaid tại 1 thời điểm

#### 4.1.3. Xem đơn hàng của bàn

**Click vào bàn có khách:**

- Hiển thị danh sách món
- Trạng thái từng món
- Tổng tiền
- Có thể: Thêm món, Xóa món, Thanh toán

#### 4.1.4. Chuyển bàn

**Chức năng:**

- Chuyển đơn hàng từ bàn này sang bàn khác

**Input:**

- Bàn nguồn (from_table_id)
- Bàn đích (to_table_id)

**Business Rules:**

- Bàn nguồn phải có đơn unpaid
- Bàn đích phải trống (available)
- Sau khi chuyển:
  - Bàn nguồn → available
  - Bàn đích → unavailable

---

### 4.2. Quản lý đơn hàng

#### 4.2.1. Xem danh sách đơn hàng

**Hiển thị:**

- Các đơn hàng đang hoạt động (unpaid)
- Lọc theo: bàn, tầng
- Click để xem chi tiết

#### 4.2.2. Thêm món vào đơn

**Flow:**

1. Vào chi tiết đơn hàng
2. Click "Thêm món"
3. Chọn món từ menu
4. Nhập số lượng, ghi chú
5. Submit → OrderItem được tạo với status='ordered'

**Business Rules:**

- Chỉ thêm món vào đơn unpaid
- Món phải có status available
- Mỗi món tạo 1 OrderItem riêng

#### 4.2.3. Cập nhật món trong đơn (Bulk Update)

**Flow:**

1. Gửi mảng món hiện tại
2. Backend so sánh với món cũ
3. Thực hiện: Thêm mới, Cập nhật, Xóa

**Logic phức tạp:**

**Case 1: Món đã có + status ordered**

- Action: Cập nhật quantity, note

**Case 2: Món không có trong mảng + status ordered/cancelled**

- Action: Xóa

**Case 3: Món không có trong mảng + status cooking/done**

- Action: Không xóa, báo lỗi
- Message: "Cannot remove item ... with status cooking"

**Case 4: Món mới**

- Action: Thêm với status ordered

**Case 5: Món đã có + status cooking**

- Action: Tạo record mới với status ordered (để chế biến thêm)

**Case 6: Món đã có + status done**

- Action: Tạo record mới với status ordered (nếu chưa có record ordered/cooking khác)

#### 4.2.4. Cập nhật trạng thái món

**Status Flow:**

```
ordered → cooking → done → served
         ↓
     cancelled (chỉ từ ordered/cooking)
```

**Business Rules:**

**✅ Cho phép:**

- ordered → cooking (bắt đầu chế biến)
- cooking → done (chế biến xong)
- done → served (đã phục vụ)
- ordered → cancelled (hủy trước khi chế biến)
- cooking → cancelled (hủy đang chế biến)

**❌ Không cho phép:**

- cooking → ordered
- done → cooking
- served → cancelled
- done → cancelled

**Xử lý nguyên liệu:**

- Khi chuyển `cooking` → `done`:
  - Signal tự động trừ nguyên liệu theo Recipe
  - Tạo StockOut với reason='used'
  - Nếu thiếu nguyên liệu → Báo lỗi, không cho chuyển

#### 4.2.5. Xóa món

**Business Rules:**

- Chỉ xóa món có status ordered hoặc cancelled
- Không thể xóa món cooking/done (đã đầu tư nguyên liệu)

**Error:**

```
"Cannot delete item with status cooking.
Only items with status ordered or cancelled can be deleted."
```

---

### 4.3. Thanh toán

#### 4.3.1. Thanh toán tiền mặt

**Flow:**

1. Click "Thanh toán" ở đơn hàng
2. Chọn "Tiền mặt"
3. Nhập tiền khách đưa
4. Hệ thống tính tiền thừa
5. Submit → Tạo Payment, đóng Order

**Input:**

- Tiền khách đưa (cashReceived)
- Giảm giá (discount)
- Thuế (tax)

**Calculation:**

```
total_amount = Σ (quantity × price_each)
final_amount = total_amount - discount - tax
change = cashReceived - final_amount
```

**Business Rules:**

- cashReceived >= final_amount
- Tạo Payment record với method='cash'
- Order.status = 'paid'
- Order.closed_at = now()
- Table.status = 'available'

#### 4.3.2. Thanh toán MoMo

**Flow:**

1. Click "Thanh toán"
2. Chọn "Ví điện tử MoMo"
3. Hệ thống tạo MoMo payment request
4. Hiển thị QR code
5. Tự động mở app MoMo (deeplink)
6. Khách quét QR/mở app → Thanh toán
7. MoMo redirect về `/payment/momo/result`
8. Trang result tự động gọi trigger callback
9. Backend cập nhật database

**Đặc biệt:**

- Không cần IPN callback thật (cho đồ án)
- Frontend tự trigger callback sau khi thanh toán
- Giống như callback thật từ MoMo

**Business Rules:**

- Tạo Payment với method='e_wallet'
- Order.status = 'paid'
- Table.status = 'available'
- Không có discount/tax (thanh toán đầy đủ)

---

### 4.4. Xem nguyên liệu kho

**Chức năng:**

- Xem danh sách nguyên liệu
- Xem số lượng tồn kho
- Xem cảnh báo sắp hết

**Không thể:**

- ❌ Nhập/xuất kho
- ❌ Sửa thông tin nguyên liệu

---

### 4.5. Dashboard Staff

#### 4.5.1. Thống kê cá nhân

**Hiển thị:**

**1. Bàn:**

- Tổng số bàn
- Bàn trống
- Bàn có khách

**2. Đơn hàng:**

- Đơn hàng hôm nay
- Đơn đang chờ (pending)

**3. Doanh thu:**

- Doanh thu hôm nay

**4. Cảnh báo:**

- Số nguyên liệu sắp hết

#### 4.5.2. Đơn hàng đang hoạt động

**Hiển thị:**

- Danh sách đơn unpaid
- Thông tin: Bàn, Tổng tiền, Thời gian tạo
- Số món theo trạng thái

#### 4.5.3. Cảnh báo

**Các loại cảnh báo:**

**1. Bàn chờ lâu:**

```
⚠️ Bàn 5 chờ quá 25 phút
```

**2. Nguyên liệu sắp hết:**

```
🔴 Thịt bò sắp hết (còn 5.0 kg)
```

**3. Món không khả dụng:**

```
ℹ️ Có 5 món ăn không khả dụng
```

#### 4.5.4. Hiệu suất cá nhân

**Hiển thị:**

- Số đơn hàng trong 30 ngày
- Tổng doanh thu
- Trung bình đơn/ngày

**Tham số:**

- `days`: Số ngày thống kê (default: 30)

**Không thể:**

- ❌ Xem hiệu suất nhân viên khác

---

## 5. QUY TRÌNH NGHIỆP VỤ CHÍNH

### 5.1. Quy trình phục vụ khách hàng (Happy Path)

```
1. Khách đến → Staff chọn bàn trống
                ↓
2. Tạo đơn hàng → Chọn món, số lượng
                ↓
3. Submit → Bàn chuyển "unavailable"
                ↓
4. Bếp nhận → Staff chuyển món "cooking"
                ↓
5. Chế biến xong → Chuyển "done" (tự động trừ nguyên liệu)
                ↓
6. Phục vụ xong → Chuyển "served"
                ↓
7. Thanh toán → Chọn tiền mặt/MoMo
                ↓
8. Hoàn tất → Bàn về "available"
```

### 5.2. Quy trình thêm món giữa bữa

```
1. Khách gọi thêm món
        ↓
2. Staff vào đơn hiện tại
        ↓
3. Click "Thêm món"
        ↓
4. Chọn món mới → Submit
        ↓
5. Món mới có status "ordered"
        ↓
6. Tiếp tục quy trình bình thường
```

### 5.3. Quy trình xử lý thiếu nguyên liệu

```
1. Admin kiểm tra kho → Thấy nguyên liệu < min_quantity
        ↓
2. Click "Cập nhật trạng thái tất cả món"
        ↓
3. Hệ thống check từng món → Set unavailable nếu thiếu
        ↓
4. Staff không thể đặt món unavailable
        ↓
5. Admin nhập kho → Stock tăng lên
        ↓
6. Admin click "Cập nhật trạng thái" lại
        ↓
7. Món trở về available
```

### 5.4. Quy trình chuyển bàn

```
1. Khách yêu cầu chuyển bàn
        ↓
2. Staff vào "Quản lý bàn"
        ↓
3. Click "Chuyển bàn"
        ↓
4. Chọn Bàn nguồn (có khách) → Bàn đích (trống)
        ↓
5. Submit → Đơn chuyển sang bàn mới
        ↓
6. Bàn cũ về "available", Bàn mới thành "unavailable"
```

### 5.5. Quy trình hủy món

```
Case 1: Món status = "ordered"
        ↓
Staff chuyển status → "cancelled"
        ↓
Hoặc xóa món khỏi đơn
        ↓
Không ảnh hưởng nguyên liệu

---

Case 2: Món status = "cooking"
        ↓
Staff chuyển status → "cancelled"
        ↓
Nguyên liệu ĐÃ bị trừ (khi chuyển cooking → done)
        ↓
Cần admin xuất kho thủ công (reason=other)

---

Case 3: Món status = "done"
        ↓
KHÔNG THỂ hủy
        ↓
Lý do: Đã chế biến xong, nguyên liệu đã dùng
```

---

## 6. BÁO CÁO VÀ THỐNG KÊ

### 6.1. Báo cáo cho Admin

#### 6.1.1. Báo cáo doanh thu

**Nội dung:**

- Doanh thu theo ngày/tuần/tháng
- Biểu đồ xu hướng
- So sánh với kỳ trước
- % thay đổi

**Nguồn dữ liệu:**

- Bảng Payment (amount)
- Lọc theo created_at

#### 6.1.2. Báo cáo đơn hàng

**Nội dung:**

- Tổng số đơn
- Số đơn theo trạng thái
- Trung bình giá trị đơn
- Số đơn theo nhân viên

**Nguồn dữ liệu:**

- Bảng Order
- Join với User (staff)

#### 6.1.3. Báo cáo món ăn

**Nội dung:**

- Top món bán chạy
- Món ít bán nhất
- Doanh thu từng món
- Tần suất đặt món

**Nguồn dữ liệu:**

- Bảng OrderItem
- Group by menu_item
- Count(id), Sum(quantity × price_each)

#### 6.1.4. Báo cáo nguyên liệu

**Nội dung:**

- Danh sách nguyên liệu sắp hết
- Lịch sử nhập/xuất kho
- Tổng giá trị tồn kho
- Nguyên liệu hao hụt

**Nguồn dữ liệu:**

- Bảng Ingredient
- Bảng StockIn, StockOut

#### 6.1.5. Báo cáo hiệu suất nhân viên

**Nội dung:**

- Số đơn từng nhân viên
- Doanh thu từng nhân viên
- Thời gian xử lý trung bình
- Xếp hạng nhân viên

**Nguồn dữ liệu:**

- Bảng Order (user_id)
- Join với Payment
- Tính: closed_at - created_at

#### 6.1.6. Báo cáo giờ cao điểm

**Nội dung:**

- Số đơn theo giờ trong ngày
- Doanh thu theo giờ
- Xác định khung giờ cao điểm

**Nguồn dữ liệu:**

- Bảng Order (created_at)
- Extract HOUR from timestamp
- Group by hour

---

### 6.2. Báo cáo cho Staff

#### 6.2.1. Thống kê cá nhân

**Nội dung:**

- Số đơn hôm nay
- Doanh thu cá nhân
- Số bàn phục vụ
- Hiệu suất theo thời gian

**Giới hạn:**

- Chỉ xem được số liệu của mình
- Không thấy số liệu nhân viên khác

#### 6.2.2. Cảnh báo thời gian thực

**Nội dung:**

- Bàn chờ lâu (> 20 phút)
- Món pending
- Nguyên liệu sắp hết

**Mục đích:**

- Giúp staff chủ động xử lý
- Tránh khách chờ lâu

---

## 7. ĐẶC ĐIỂM KỸ THUẬT

### 7.1. Soft Delete

**Áp dụng cho:**

- User, Table, Category, MenuItem, Ingredient, Recipe

**Cơ chế:**

- Không xóa thật trong database
- Set field `deleted_at = now()`
- Query luôn thêm filter `deleted_at__isnull=True`

**Lợi ích:**

- Có thể khôi phục nếu cần
- Giữ lịch sử dữ liệu
- Tránh lỗi foreign key

### 7.2. Signal tự động

**OrderItem status changed signal:**

```python
@receiver(post_save, sender=OrderItem)
def handle_order_item_status_change(sender, instance, **kwargs):
    if instance.status == 'done':
        # Tự động trừ nguyên liệu
        deduct_ingredients(instance)
        # Tạo StockOut record
        create_stock_out(instance)
```

**Ưu điểm:**

- Tự động hóa nghiệp vụ
- Đảm bảo tính nhất quán
- Không cần developer nhớ gọi

### 7.3. Transaction

**Sử dụng:**

```python
with transaction.atomic():
    # Tạo Payment
    payment = Payment.objects.create(...)

    # Update Order
    order.status = 'paid'
    order.save()

    # Update Table
    table.status = 'available'
    table.save()
```

**Lợi ích:**

- Rollback nếu có lỗi
- Đảm bảo tính toàn vẹn dữ liệu

---

## 8. CÁC TRƯỜNG HỢP ĐẶC BIỆT

### 8.1. Thiếu nguyên liệu giữa chừng

**Tình huống:**

- Staff đã nhận món (status = cooking)
- Bếp phát hiện thiếu nguyên liệu

**Xử lý:**

1. Không chuyển done (vì sẽ báo lỗi thiếu nguyên liệu)
2. Chuyển về cancelled
3. Thông báo khách
4. Admin nhập kho
5. Tạo món mới

### 8.2. Khách ăn xong không thanh toán

**Tình huống:**

- Khách rời đi nhưng chưa thanh toán
- Bàn vẫn unavailable

**Xử lý:**

1. Admin vào "Lịch sử đơn hàng"
2. Tìm đơn của bàn đó (unpaid)
3. Click "Thanh toán" thay khách
4. Chọn tiền mặt, nhập số tiền thực tế
5. Hoàn tất → Bàn về available

### 8.3. Thay đổi món sau khi cooking

**Tình huống:**

- Món đã cooking
- Khách đổi ý, muốn thêm/bớt

**Xử lý:**

- KHÔNG xóa món cooking/done
- Tạo món mới với status ordered
- Hệ thống tự động tạo record mới

**Ví dụ:**

```
Phở bò (cooking) x2  ← Giữ nguyên
Phở bò (ordered) x1  ← Thêm mới
```

### 8.4. Admin sai khi nhập kho

**Tình huống:**

- Nhập sai số lượng, giá

**Xử lý:**

1. Xuất kho số lượng đã nhập (reason=other)
2. Nhập kho lại với số liệu đúng

**Lưu ý:**

- Không có chức năng "Sửa phiếu nhập"
- Chỉ có thể nhập mới hoặc xuất điều chỉnh

---

## 9. KẾT LUẬN

### 9.1. Ưu điểm hệ thống

✅ **Phân quyền rõ ràng**

- Admin: Toàn quyền quản lý
- Staff: Chỉ phục vụ khách

✅ **Tự động hóa cao**

- Tự động trừ nguyên liệu
- Tự động cảnh báo thiếu hàng
- Tự động cập nhật trạng thái bàn

✅ **Báo cáo đa dạng**

- Dashboard real-time
- Insights nâng cao
- Hiệu suất nhân viên

✅ **Thanh toán linh hoạt**

- Tiền mặt
- MoMo (QR code)
- Dễ mở rộng thêm phương thức

✅ **Bảo toàn dữ liệu**

- Soft delete
- Lịch sử đầy đủ

### 9.2. Giới hạn

⚠️ **MoMo IPN Callback**

- Cần ngrok hoặc public domain để test thật
- Hiện tại dùng manual trigger (phù hợp đồ án)

⚠️ **Không có chức năng:**

- Đặt bàn trước
- Quản lý ca làm việc
- Tích lũy điểm khách hàng
- In hóa đơn

### 9.3. Hướng phát triển

🚀 **Tương lai:**

- Thêm vai trò "Chef" (quản lý bếp)
- Mobile app cho Staff
- Tích hợp thêm payment gateway (VNPay, ZaloPay)
- Quản lý bàn đặt trước
- AI dự đoán nhu cầu nguyên liệu

---

**Tài liệu này mô tả đầy đủ nghiệp vụ của hệ thống quản lý nhà hàng cho cả Admin và Staff.**

**Ngày cập nhật:** 30/11/2025  
**Phiên bản:** 1.0.0
