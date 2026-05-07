# PRODUCT PLAN — Mini CRM (Agent Build Instructions)

## 1. PROJECT OVERVIEW

**Tên project:** Mini CRM — Sales Management System  
**Mục đích:** Hệ thống quản lý khách hàng và đơn hàng nội bộ cho đội ngũ bán hàng  
**Đối tượng người dùng:** Admin (quản lý), Staff (nhân viên bán hàng)  
**Demo URL mục tiêu:** Deploy lên Railway hoặc Render (free tier)

---

## 2. TECH STACK

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Backend     | Node.js v18+ / Express.js         |
| Database    | MySQL 8 (ORM: raw mysql2/promise) |
| Auth        | JWT (jsonwebtoken + bcryptjs)     |
| Validation  | express-validator                 |
| Frontend    | React (Vite) + Tailwind CSS       |
| Container   | Docker + docker-compose           |
| Version     | Git + GitHub                      |
| Deploy      | Railway / Render                  |

---

## 3. DATABASE SCHEMA

### Table: `users`
```sql
id, name, email (unique), password (hashed), role ENUM('admin','staff'), created_at, updated_at
```

### Table: `customers`
```sql
id, name, email, phone, address, status ENUM('active','inactive'),
assigned_to (FK → users.id), notes, created_at, updated_at
```

### Table: `orders`
```sql
id, customer_id (FK → customers.id), assigned_to (FK → users.id),
total_amount DECIMAL(15,2), status ENUM('new','processing','completed','cancelled'),
notes, ordered_at, updated_at
```

### Table: `order_items`
```sql
id, order_id (FK → orders.id), product VARCHAR(200), quantity INT, unit_price DECIMAL(15,2)
```

---

## 4. PROJECT STRUCTURE

```
mini-crm/
├── backend/
│   ├── src/
│   │   ├── app.js                   # Entry point: Express setup, middleware, routes
│   │   ├── config/
│   │   │   ├── db.js                # MySQL pool connection (mysql2/promise)
│   │   │   └── migrate.js           # Run: node src/config/migrate.js
│   │   ├── middlewares/
│   │   │   ├── auth.js              # authenticate(JWT), authorizeAdmin
│   │   │   └── errorHandler.js      # validate(), global errorHandler
│   │   ├── controllers/
│   │   │   ├── authController.js    # register, login, getProfile
│   │   │   ├── customerController.js# getAll, getOne, create, update, remove
│   │   │   ├── orderController.js   # getAll, getOne, create, updateStatus, remove
│   │   │   └── dashboardController.js # getSummary
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── customers.js
│   │   │   ├── orders.js
│   │   │   └── dashboard.js
│   │   └── utils/
│   │       └── paginate.js          # Helper: offset/limit từ page & limit query
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                  # React Router setup
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance với baseURL + JWT interceptor
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Customers/
│   │   │   │   ├── CustomerList.jsx
│   │   │   │   ├── CustomerDetail.jsx
│   │   │   │   └── CustomerForm.jsx
│   │   │   └── Orders/
│   │   │       ├── OrderList.jsx
│   │   │       ├── OrderDetail.jsx
│   │   │       └── OrderForm.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── ProtectedRoute.jsx   # Redirect nếu chưa login
│   │       ├── Table.jsx            # Reusable table với pagination
│   │       └── StatusBadge.jsx
│   ├── index.html
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 5. API ENDPOINTS

### Auth
| Method | Endpoint           | Access | Description              |
|--------|--------------------|--------|--------------------------|
| POST   | /api/auth/register | Public | Tạo tài khoản mới        |
| POST   | /api/auth/login    | Public | Đăng nhập, nhận JWT      |
| GET    | /api/auth/me       | Auth   | Xem thông tin cá nhân    |

### Customers
| Method | Endpoint              | Access      | Description                          |
|--------|-----------------------|-------------|--------------------------------------|
| GET    | /api/customers        | Auth        | Danh sách KH (search, filter, paging)|
| GET    | /api/customers/:id    | Auth        | Chi tiết KH + đơn hàng gần nhất      |
| POST   | /api/customers        | Auth        | Tạo KH mới                           |
| PUT    | /api/customers/:id    | Auth        | Cập nhật KH                          |
| DELETE | /api/customers/:id    | Admin only  | Xóa KH                               |

### Orders
| Method | Endpoint                       | Access      | Description              |
|--------|--------------------------------|-------------|--------------------------|
| GET    | /api/orders                    | Auth        | Danh sách đơn hàng       |
| GET    | /api/orders/:id                | Auth        | Chi tiết đơn + line items|
| POST   | /api/orders                    | Auth        | Tạo đơn hàng mới         |
| PATCH  | /api/orders/:id/status         | Auth        | Cập nhật trạng thái      |
| DELETE | /api/orders/:id                | Admin only  | Xóa đơn hàng             |

### Dashboard
| Method | Endpoint              | Access | Description                              |
|--------|-----------------------|--------|------------------------------------------|
| GET    | /api/dashboard/summary| Auth   | Tổng KH, tổng đơn, doanh thu, đơn mới   |

---

## 6. FEATURE REQUIREMENTS

### 6.1 Authentication
- [x] Register với role admin/staff
- [x] Login trả về JWT token (expires 7 ngày)
- [x] Protected routes qua Bearer token
- [x] Role-based: admin có thêm quyền xóa

### 6.2 Customer Management
- [x] CRUD đầy đủ
- [x] Search theo name, email, phone
- [x] Filter theo status (active/inactive)
- [x] Pagination (page, limit)
- [x] Assign KH cho staff cụ thể
- [x] Xem lịch sử 5 đơn hàng gần nhất của KH

### 6.3 Order Management
- [x] Tạo đơn hàng với nhiều sản phẩm (order_items)
- [x] Tự tính total_amount từ order_items
- [x] Cập nhật status đơn: new → processing → completed / cancelled
- [x] Gán đơn cho staff
- [x] Filter theo status, customer_id

### 6.4 Dashboard
- [x] Tổng số khách hàng active
- [x] Tổng đơn hàng hôm nay
- [x] Tổng doanh thu tháng này
- [x] Số đơn theo từng status (biểu đồ cột đơn giản)

### 6.5 Frontend (React)
- [x] Login page với form validation
- [x] Sidebar navigation
- [x] Dashboard với 4 metric cards
- [x] Customer list với search + filter + pagination
- [x] Customer detail page
- [x] Order list với filter status
- [x] Order create form với dynamic line items
- [x] JWT lưu trong localStorage, tự attach vào Axios header
- [x] ProtectedRoute redirect về /login nếu chưa auth

---

## 7. DOCKER SETUP

### docker-compose.yml (yêu cầu tạo)
```yaml
version: '3.8'
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mini_crm
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file: ./backend/.env
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

## 8. CODING CONVENTIONS

- Tất cả error phải đi qua `next(err)` → global errorHandler
- Response thành công luôn có key `message`
- Danh sách luôn trả về `{ data: [...], pagination: {...} }`
- Không hardcode secret — dùng `.env`
- Mỗi controller là async/await, không dùng callback
- Validate input với express-validator trước khi vào controller

---

## 9. BUILD ORDER (thứ tự agent nên làm)

1. Setup Express app.js + kết nối DB
2. Viết migrate.js + chạy tạo bảng
3. Auth: controller → route → test bằng curl
4. Customer: controller → route → test
5. Order: controller (tính total_amount tự động) → route → test
6. Dashboard: query aggregate → route
7. Viết Dockerfile cho backend
8. Setup React + Vite + Tailwind
9. Tạo Axios instance + auth context
10. Build từng page theo thứ tự: Login → Dashboard → Customers → Orders
11. docker-compose toàn bộ stack
12. Viết README.md

---

## 10. ACCEPTANCE CRITERIA

- [ ] Có thể đăng ký, đăng nhập, nhận JWT
- [ ] Admin tạo/sửa/xóa KH; Staff chỉ tạo/sửa
- [ ] Tạo đơn hàng với ít nhất 2 line items, total tính đúng
- [ ] Dashboard hiển thị đúng số liệu thực từ DB
- [ ] Chạy được bằng `docker-compose up`
- [ ] README có hướng dẫn setup và link demo
