# PlantWeb

Nền tảng thương mại điện tử bán cây cảnh, chậu và phụ kiện. Gồm API Express.js, website khách hàng và trang quản trị tách riêng.

## Tech stack

| Layer | Công nghệ |
|-------|-----------|
| Backend | Express.js, Node.js, MS SQL Server |
| Frontend User | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand |
| Frontend Admin | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand |
| Auth | JWT, bcryptjs, Google OAuth |
| Thanh toán | COD, VNPay, PayOS, chuyển khoản |

## Cấu trúc project

```
PlantWeb/
├── backend/          # API Express (port 5000)
├── frontend-user/    # Website khách hàng (port 5173)
├── frontend-admin/   # Trang quản trị (port 5176)
└── frontend/         # Phiên bản cũ — gộp user + admin (không dùng mặc định)
```

## Yêu cầu hệ thống

| Công cụ | Ghi chú |
|---------|---------|
| **Node.js** | Khuyến nghị v18+ hoặc v20+ |
| **npm** | Đi kèm Node.js |
| **MS SQL Server** | Bắt buộc — backend dùng SQL Server |

---

## Hướng dẫn chạy sau khi clone

### 1. Clone repository

```bash
git clone <url-repo-github-cua-ban>
cd PlantWeb
```

### 2. Cài và chạy SQL Server

Trên máy mới cần cài **SQL Server** hoặc **SQL Server Express**, sau đó ghi nhớ:

- Server name (thường là `localhost` hoặc `localhost\SQLEXPRESS`)
- Tài khoản `sa` và mật khẩu (hoặc user SQL khác có quyền tạo database)

### 3. Backend (API)

```bash
cd backend
npm install
```

Tạo file cấu hình từ mẫu:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Sửa `backend/.env` — tối thiểu cần các biến sau:

```env
PORT=5000
JWT_SECRET=dat_mot_chuoi_bi_mat_dai

DB_SERVER=localhost
DB_DATABASE=PlantShopDB
DB_USER=sa
DB_PASSWORD=mat_khau_sql_cua_ban
DB_TRUST_CERT=true

CORS_ORIGINS=http://localhost:5173,http://localhost:5176
```

Tạo database, chạy migration và seed dữ liệu mẫu:

```bash
npm run setup
```

Chạy API:

```bash
npm run dev
```

Backend chạy tại **http://localhost:5000**. Lệnh `npm run dev` cũng tự chạy migration khi khởi động.

#### Scripts backend hữu ích

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev với nodemon + auto migration |
| `npm start` | Chạy production |
| `npm run setup` | Tạo DB + migration + seed |
| `npm run setup:no-seed` | Tạo DB + migration, không seed |
| `npm run seed` | Seed lại dữ liệu mẫu |
| `npm run migrate` | Chạy migration |
| `npm run migrate:status` | Xem trạng thái migration |

### 4. Frontend User (khách hàng)

```bash
cd frontend-user
npm install
```

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Nội dung `frontend-user/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=          # tùy chọn — đăng nhập Google
```

```bash
npm run dev
```

Mở **http://localhost:5173**

### 5. Frontend Admin (quản trị)

```bash
cd frontend-admin
npm install
```

Tạo file `frontend-admin/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Mở **http://localhost:5176**

---

## Chạy đồng thời

Cần **3 terminal** riêng:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend User
cd frontend-user && npm run dev

# Terminal 3 — Frontend Admin
cd frontend-admin && npm run dev
```

**Thứ tự khởi động:** SQL Server → Backend → Frontend

## Tài khoản mẫu (sau `npm run setup`)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `thanhtung@admin.com` | `123456` |
| Khách hàng | `thanhtung@user.com` | `123456` |

---

## Tính năng tùy chọn

Các biến trong `backend/.env.example` chỉ cần khi bật tính năng tương ứng:

| Biến môi trường | Tính năng |
|-----------------|-----------|
| `VNPAY_*`, `PAYOS_*` | Thanh toán online |
| `GOOGLE_CLIENT_ID`, `FACEBOOK_*` | Đăng nhập OAuth |
| `CLOUDINARY_*` | Upload ảnh lên cloud |
| `OPENROUTER_*` | AI viết blog (admin) |
| `SMTP_*` | Gửi email |

Shop cơ bản (xem sản phẩm, giỏ hàng, đặt hàng COD) chạy được mà **không cần** cấu hình các mục trên.

---

## Lưu ý quan trọng

1. **`.env` không có trên GitHub** — máy mới phải tự tạo và điền lại từ file `.env.example`.
2. **`node_modules` không có trên GitHub** — phải `npm install` ở `backend`, `frontend-user` và `frontend-admin`.
3. **Database trống sau clone** — bắt buộc chạy `npm run setup` (hoặc `npm run migrate` + `npm run seed`).
4. **Lỗi kết nối SQL Server** — kiểm tra `DB_SERVER`, `DB_USER`, `DB_PASSWORD` và SQL Server đã bật chưa.

### Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `ELOGIN` | Sai `DB_USER` hoặc `DB_PASSWORD` |
| `ESOCKET` | SQL Server chưa chạy hoặc sai `DB_SERVER` |
| `Missing required env var: VITE_API_URL` | Chưa tạo file `.env` cho frontend |
| CORS error | Thêm URL frontend vào `CORS_ORIGINS` trong `backend/.env` |

---

## Production

```bash
# Backend
cd backend
npm start

# Frontend User
cd frontend-user
npm run build    # output: dist/

# Frontend Admin
cd frontend-admin
npm run build    # output: dist/
```

Deploy `dist/` lên hosting tĩnh (Nginx, Vercel, Netlify, …). Backend cần server Node.js và SQL Server production.