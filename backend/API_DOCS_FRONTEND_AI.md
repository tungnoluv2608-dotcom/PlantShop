# PlantWeb Backend API Docs For Frontend Generation

This document is written for an AI frontend builder.

Goal: build a complete frontend project for PlantWeb using the existing backend exactly as implemented.

Do not invent endpoints, fields, payment flows, or AI capabilities outside this document.

## 1. Project Overview

PlantWeb is an e-commerce application for:

- selling plants
- selling planters
- selling plant-care accessories
- publishing blog content
- taking wholesale inquiries
- supporting customer accounts, address book, orders, reviews, wishlist
- supporting admin CMS and admin operations
- providing 2 AI-powered features from backend:
  - product advisor
  - AI blog draft generator for admin

The frontend should have:

- public storefront
- authenticated customer area
- admin dashboard
- payment return/callback pages
- full integration with AI endpoints exposed by backend

## 2. Base URL And Transport

- API base URL: `http://localhost:5000/api` in local development
- Root health check: `GET http://localhost:5000/`
- Request/response format: JSON unless using file upload
- File upload content type: `multipart/form-data`
- Authentication: `Authorization: Bearer <jwt>`

Recommended frontend env:

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Authentication Model

There are 2 JWT contexts:

- customer JWT from `/api/auth/*`
- admin JWT from `/api/admin/login`

JWT payload contains:

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "customer"
}
```

or

```json
{
  "id": 99,
  "email": "admin@example.com",
  "role": "admin"
}
```

Backend authorization rules:

- customer endpoints require any valid JWT
- admin endpoints require valid JWT with `role === "admin"`
- upload endpoints require any valid JWT
  - customer JWT is used for review image upload
  - admin JWT is used for CMS uploads

## 4. Common Error Shape

Most backend errors return:

```json
{
  "message": "Human readable message"
}
```

Common auth errors:

- `401 { "message": "Không có token xác thực." }`
- `401 { "message": "Token không hợp lệ hoặc đã hết hạn." }`
- `403 { "message": "Bạn không có quyền truy cập." }`

Frontend should always surface `response.data.message` if present.

## 5. Core Data Shapes

### 5.1 User

```ts
type User = {
  id: string | number
  name: string
  email: string
  role?: "customer" | "admin"
}
```

### 5.2 Product

```ts
type CareGuide = {
  title: string
  content: string
}

type Product = {
  id: string
  title: string
  price: number
  originalPrice?: number | null
  discount?: string | null
  description: string
  imageUrl: string
  images: string[]
  category: string
  bio?: string | null
  inStock?: boolean
  careGuide?: CareGuide[]
  planterOptions?: Array<string | number>
  isFavorite?: boolean
  favoriteCreatedAt?: string
}
```

### 5.3 Planter / Accessory

```ts
type Planter = {
  id: string
  name: string
  material: string
  accessoryBrand?: string
  usageTags?: string[]
  price: number
  imageUrl: string
  sizes: string[]
  inStock: boolean
  type: "planter" | "accessory"
}
```

### 5.4 Blog Post

```ts
type BlogPost = {
  id: string
  title: string
  image: string
  excerpt: string
  content: string
  category: string
  readTime: string
  tags: string[]
  featured: boolean
  date: string
}
```

### 5.5 Review

```ts
type Review = {
  id: string
  productId: string
  userName: string
  avatar: string
  rating: number
  title: string
  content: string
  helpful: number
  verified: boolean
  date: string
  images: string[]
  tags: string[]
}
```

### 5.6 Address

```ts
type ShippingAddress = {
  id: string
  label: string
  fullName: string
  phone: string
  province: string
  district: string
  ward?: string
  address: string
  isDefault: boolean
}
```

### 5.7 Cart Item And Order Item

Important:

- cart item ids are not always plain product ids
- backend parses cart item ids to determine real source entity

Supported cart id patterns:

- plain product: `"12"`
- product without planter: `"product-12-none"`
- product with planter add-on: `"product-12-planter-7"`
- planter item: `"planter-5"`
- accessory item: `"accessory-9"`

Response order items:

```ts
type OrderItem = {
  id: string
  title: string
  price: number
  quantity: number
  image: string
  planter: string
}
```

Notes:

- product order items usually come back with numeric string id such as `"12"`
- planter order items come back as `"planter-5"`
- accessory order items come back as `"accessory-9"`
- `planter` field is a display label, not a planter object

### 5.8 Order Timeline

```ts
type OrderTimeline = {
  status: string
  date: string
  done: boolean
}
```

### 5.9 Order

```ts
type Order = {
  id: string
  date: string
  status: "pending" | "confirmed" | "packing" | "shipping" | "delivered" | "cancelled" | "returning"
  items: OrderItem[]
  shippingAddress: string
  paymentMethod: string
  subtotal: number
  shippingFee: number
  total: number
  trackingNumber?: string | null
  trackingProvider?: "ghn" | "ghtk" | "viettelpost" | "other" | null
  trackingUrl?: string | null
  timeline: OrderTimeline[]
}
```

### 5.10 Wholesale Inquiry

```ts
type WholesaleInquiryStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "won"
  | "lost"
  | "archived"

type WholesaleInquiry = {
  id: string
  company: string
  contact: string
  phone: string
  email: string
  quantity: string
  type: string
  location: string
  budget: string
  timeline: string
  note: string
  status: WholesaleInquiryStatus
  source: string
  assignedTo: string
  adminNote: string
  createdAt: string
  updatedAt: string
  contactedAt?: string | null
  closedAt?: string | null
}
```

## 6. Public And Customer API

## 6.1 Auth

### POST `/api/auth/signup`

Create customer account.

Request:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "12345678",
  "confirmPassword": "12345678"
}
```

Success:

```json
{
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@example.com"
  },
  "token": "jwt"
}
```

Validation behavior:

- missing name/email/password -> `400`
- password != confirmPassword -> `400`
- duplicate email -> `409`

### POST `/api/auth/signin`

Request:

```json
{
  "email": "a@example.com",
  "password": "12345678"
}
```

Success:

```json
{
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@example.com"
  },
  "token": "jwt"
}
```

### GET `/api/auth/me`

Auth required.

Success:

```json
{
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@example.com"
  }
}
```

### POST `/api/auth/google`

Google OAuth login via Google credential token.

Request:

```json
{
  "credential": "google_id_token"
}
```

Success:

```json
{
  "token": "jwt",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "role": "customer"
  }
}
```

### POST `/api/auth/facebook`

Facebook OAuth login.

Request:

```json
{
  "accessToken": "facebook_access_token",
  "userId": "facebook_user_id"
}
```

Success:

```json
{
  "token": "jwt",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "role": "customer"
  }
}
```

## 6.2 Categories

### GET `/api/categories`

Response:

```json
[
  {
    "id": "1",
    "name": "Cay trong nha",
    "image": "https://...",
    "subcategories": ["De ban", "De san"]
  }
]
```

## 6.3 Products

### GET `/api/products`

Product listing with filtering, sorting and pagination.

Query params:

- `category?: string`
- `search?: string`
- `minPrice?: number`
- `maxPrice?: number`
- `page?: number` default `1`
- `pageSize?: number` default `9`
- `sort?: "default" | "sale" | "trending" | "best-selling" | "price-asc" | "price-desc"`
- `saleOnly?: "true" | "false"`

Success:

```json
{
  "products": [
    {
      "id": 1,
      "title": "Monstera",
      "price": 350000,
      "originalPrice": 390000,
      "discount": "10%",
      "description": "Mo ta",
      "imageUrl": "https://...",
      "images": ["https://..."],
      "category": "Cay trong nha",
      "bio": "Noi dung them",
      "inStock": true,
      "careGuide": [
        { "title": "Tuoi nuoc", "content": "..." }
      ],
      "planterOptions": [1, 2, 7]
    }
  ],
  "total": 42
}
```

Important frontend rule:

- use `total` with current `page/pageSize` to render pagination
- product ids may be returned as numbers by backend, but frontend should normalize to string

### GET `/api/products/search`

Quick search for autocomplete.

Query params:

- `q?: string`
- `limit?: number` default `5`

Success:

```json
[
  { "id": 1, "title": "Monstera", "category": "Cay trong nha" }
]
```

### GET `/api/products/:id`

Product detail.

Success:

```json
{
  "id": 1,
  "title": "Monstera",
  "price": 350000,
  "originalPrice": 390000,
  "discount": "10%",
  "description": "Mo ta",
  "imageUrl": "https://...",
  "images": ["https://...", "https://..."],
  "category": "Cay trong nha",
  "bio": "Noi dung them",
  "inStock": true,
  "careGuide": [
    { "title": "Tuoi nuoc", "content": "..." }
  ],
  "planterOptions": [1, 2, 7]
}
```

### GET `/api/products/:id/related`

Query params:

- `limit?: number` default `4`

Success:

```json
[
  {
    "id": 9,
    "title": "Alocasia",
    "price": 280000,
    "imageUrl": "https://...",
    "images": ["https://..."],
    "category": "Cay trong nha",
    "description": "..."
  }
]
```

### POST `/api/products/advisor`

AI-powered product advisor.

Auth is optional:

- without JWT: still returns recommendations
- with JWT: returns recommendations and stores history for current user

Request:

```json
{
  "budget": 500000,
  "lightLevel": "medium",
  "hasPets": true,
  "priority": "easy-care",
  "customPrompt": "Muon cay nho gon de ban lam viec"
}
```

Allowed values:

- `lightLevel`: `low | medium | bright`
- `priority`: `easy-care | decor`

Success:

```json
{
  "summary": "Day la nhom cay duoc loc ...",
  "recommendations": [
    {
      "product": {
        "id": 1,
        "title": "Monstera",
        "price": 350000,
        "imageUrl": "https://...",
        "images": ["https://..."],
        "category": "Cay trong nha",
        "description": "...",
        "careGuide": [],
        "bio": "...",
        "inStock": true,
        "planterOptions": [1, 2]
      },
      "reason": "Ly do goi y...",
      "fitTags": ["Trong ngan sach", "Uu tien de cham"]
    }
  ]
}
```

Frontend notes:

- render this as a conversational recommendation UI
- allow anonymous use
- if logged in, also show advisor history screen
- `customPrompt` is optional but powerful and should be implemented

### GET `/api/products/advisor/history`

Auth required.

Returns latest advisor sessions for current user.

Success:

```json
[
  {
    "id": 12,
    "budget": 500000,
    "lightLevel": "medium",
    "hasPets": true,
    "priority": "easy-care",
    "customPrompt": "Muon cay nho gon",
    "summary": "Day la nhom cay ...",
    "createdAt": "2026-05-27T10:00:00.000Z",
    "recommendations": [
      {
        "product": {
          "id": 1,
          "title": "Monstera",
          "price": 350000,
          "imageUrl": "https://..."
        },
        "reason": "Ly do",
        "fitTags": ["Trong ngan sach"]
      }
    ]
  }
]
```

## 6.4 Planters And Accessories

The same backend resource is used for planters and accessories.

### GET `/api/planters`

Query params:

- `type?: "planter" | "accessory"`

Success:

```json
[
  {
    "id": "5",
    "name": "Chau gom trang",
    "material": "Gom",
    "accessoryBrand": "",
    "usageTags": [],
    "price": 90000,
    "imageUrl": "https://...",
    "inStock": true,
    "type": "planter",
    "sizes": ["S", "M"]
  }
]
```

Recommended frontend routing:

- `/planters` should call `GET /api/planters?type=planter`
- `/accessories` should call `GET /api/planters?type=accessory`

### GET `/api/planters/:id`

Query params:

- `type?: "planter" | "accessory"`

Success:

```json
{
  "id": "9",
  "name": "Binh xit tuoi",
  "material": "Dung cu cham cay",
  "accessoryBrand": "Gardena",
  "usageTags": ["Tuoi cay", "Cham soc la"],
  "price": 120000,
  "imageUrl": "https://...",
  "inStock": true,
  "type": "accessory",
  "sizes": []
}
```

## 6.5 Blog

### GET `/api/blog/categories`

Success:

```json
[
  { "name": "Cham soc", "total": 8 },
  { "name": "Tin tuc", "total": 5 }
]
```

### GET `/api/blog`

Query params:

- `category?: string`
- `search?: string`
- `featured?: "true" | "false"`

Success:

```json
[
  {
    "id": "1",
    "title": "Cach cham monstera",
    "image": "https://...",
    "excerpt": "Tom tat...",
    "content": "Markdown content...",
    "category": "Cham soc",
    "readTime": "5 phut",
    "tags": ["monstera", "cham soc"],
    "featured": true,
    "date": "2026-05-20"
  }
]
```

### GET `/api/blog/:id`

Returns single `BlogPost`.

## 6.6 Reviews

### GET `/api/reviews?productId=:id`

Success:

```json
[
  {
    "id": "11",
    "productId": "1",
    "userName": "Nguyen Van A",
    "avatar": "https://i.pravatar.cc/48?u=1",
    "rating": 5,
    "title": "Rat dep",
    "content": "Cay dep, dong goi ky",
    "helpful": 0,
    "verified": true,
    "date": "2026-05-22",
    "images": ["https://..."],
    "tags": ["tuoi", "dep"]
  }
]
```

### POST `/api/reviews`

Auth required.

Rule:

- only users with a delivered order containing that product can post review

Request:

```json
{
  "productId": "1",
  "rating": 5,
  "title": "Rat dep",
  "content": "Cay dep, dong goi ky",
  "tags": ["tuoi", "dep"],
  "images": ["https://..."]
}
```

Success:

```json
{
  "message": "Đánh giá đã được gửi.",
  "id": 11
}
```

Validation:

- title min length `3`
- content min length `10`
- max tags stored: `8`
- max images stored: `5`

## 6.7 Upload

Used by:

- customer review image upload
- admin CMS image upload

Auth required.

Rate-limited.

Accepted image types:

- jpg
- jpeg
- png
- gif
- webp

Max file size:

- 5MB per file

### POST `/api/upload`

Form field:

- `image`

Success:

```json
{
  "url": "https://res.cloudinary.com/...",
  "filename": "plantweb/abc123"
}
```

### POST `/api/upload/multiple`

Form field:

- `images[]` or repeated `images`

Success:

```json
{
  "urls": [
    "https://res.cloudinary.com/...",
    "https://res.cloudinary.com/..."
  ]
}
```

Frontend implementation note:

- use user token for review image upload
- use admin token for admin image upload

## 6.8 Wishlist

Auth required.

### GET `/api/wishlist`

Returns array of `Product` with:

- `isFavorite: true`
- `favoriteCreatedAt`

### POST `/api/wishlist/:productId`

Success:

```json
{
  "message": "Đã thêm vào danh sách yêu thích."
}
```

### DELETE `/api/wishlist/:productId`

Success:

```json
{
  "message": "Đã xóa khỏi danh sách yêu thích."
}
```

## 6.9 Address Book

Auth required.

### GET `/api/addresses`

Success:

```json
[
  {
    "id": "1",
    "label": "Nha rieng",
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "province": "TP.HCM",
    "district": "Quan 1",
    "ward": "Ben Nghe",
    "address": "123 Nguyen Hue",
    "isDefault": true
  }
]
```

### POST `/api/addresses`

Request:

```json
{
  "label": "Nha rieng",
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "province": "TP.HCM",
  "district": "Quan 1",
  "ward": "Ben Nghe",
  "address": "123 Nguyen Hue",
  "isDefault": true
}
```

Success returns created address object.

### PUT `/api/addresses/:id`

Same request body as create.

Success returns updated address object.

### DELETE `/api/addresses/:id`

Success:

```json
{
  "message": "Đã xóa địa chỉ."
}
```

### PATCH `/api/addresses/:id/default`

Success:

```json
{
  "message": "Đã đặt mặc định."
}
```

## 6.10 Orders

Auth required unless explicitly noted otherwise.

### Shipping rules enforced by backend

- `shippingMethod = standard`
  - fee is `0` if subtotal `>= SHIPPING_STANDARD_FREE_THRESHOLD`
  - else fee is `SHIPPING_STANDARD_FEE`
- `shippingMethod = express`
  - fee is `SHIPPING_EXPRESS_FEE`
- `shippingMethod = sameday`
  - fee is `SHIPPING_SAMEDAY_FEE`

Do not trust client-side totals.

Backend recalculates:

- unit item prices
- planter add-on price
- subtotal
- shipping fee
- total

### POST `/api/orders`

Create order from cart.

Request:

```json
{
  "items": [
    {
      "id": "product-12-planter-7",
      "quantity": 2
    },
    {
      "id": "accessory-9",
      "quantity": 1
    }
  ],
  "shippingAddress": "123 Nguyen Hue, Ben Nghe, Quan 1, TP.HCM",
  "shippingMethod": "express",
  "paymentMethod": "payos"
}
```

Allowed values:

- `shippingMethod`: `standard | express | sameday`
- `paymentMethod`: `cod | payos | vnpay`

Important:

- frontend may include extra cart fields such as `title`, `price`, `image`, `planter`
- backend ignores them for pricing authority
- only `id` and `quantity` are authoritative for order line source

Success:

```json
{
  "orderId": "PSTT-2026-00001",
  "message": "Đặt hàng thành công.",
  "subtotal": 820000,
  "shippingFee": 30000,
  "total": 850000
}
```

### GET `/api/orders`

Returns current user orders.

Success:

```json
[
  {
    "id": "PSTT-2026-00001",
    "date": "2026-05-28",
    "status": "pending",
    "shippingAddress": "123 Nguyen Hue...",
    "paymentMethod": "payos",
    "subtotal": 820000,
    "shippingFee": 30000,
    "total": 850000,
    "trackingNumber": null,
    "trackingProvider": null,
    "trackingUrl": null,
    "items": [
      {
        "id": "12",
        "title": "Monstera",
        "price": 410000,
        "quantity": 2,
        "image": "https://...",
        "planter": "Có (Kèm Chậu gốm trắng +60.000đ)"
      }
    ],
    "timeline": [
      {
        "status": "Đặt hàng thành công",
        "date": "2026-05-28 10:00:00",
        "done": true
      }
    ]
  }
]
```

### GET `/api/orders/:id`

Returns full order detail for current user.

### PATCH `/api/orders/:id/cancel`

Only works when order status is:

- `pending`
- `confirmed`

Success:

```json
{
  "message": "Đơn hàng đã được hủy."
}
```

### POST `/api/orders/:id/vnpay-url`

Create VNPay checkout URL.

Request body:

```json
{}
```

Success:

```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
}
```

### GET `/api/orders/vnpay/verify`

Public endpoint used by frontend return page after VNPay redirect.

Frontend should call with original VNPay query string.

Success cases:

```json
{
  "success": true,
  "orderId": "PSTT-2026-00001",
  "message": "Thanh toán VNPay thành công."
}
```

or

```json
{
  "success": false,
  "orderId": "PSTT-2026-00001",
  "message": "Thanh toán VNPay thất bại."
}
```

### POST `/api/orders/:id/payos-url`

Create PayOS checkout session.

Request body:

```json
{
  "buyerPhone": "0901234567"
}
```

Success:

```json
{
  "checkoutUrl": "https://pay.payos.vn/web/...",
  "qrCode": "000201010212...",
  "paymentLinkId": "abcd1234",
  "orderCode": 202600001
}
```

### GET `/api/orders/payos/verify`

Public endpoint used by frontend return page after PayOS redirect.

Supported query params:

- `id`
- `orderCode`

Success paid:

```json
{
  "success": true,
  "orderId": "PSTT-2026-00001",
  "status": "PAID"
}
```

Pending or unpaid:

```json
{
  "success": false,
  "orderId": "PSTT-2026-00001",
  "status": "PENDING",
  "message": "Thanh toán PayOS chưa hoàn tất."
}
```

### Backend-only webhook

Do not use from frontend:

- `POST /api/webhooks/payos-webhook`

## 6.11 Wholesale Inquiry

### POST `/api/wholesale-inquiries`

Public endpoint.

Rate limited.

Request:

```json
{
  "company": "Cong ty ABC",
  "contact": "Tran Thi B",
  "phone": "0901234567",
  "email": "b@example.com",
  "quantity": "50 chau",
  "type": "Van phong",
  "location": "TP.HCM",
  "budget": "10-20 trieu",
  "timeline": "Trong 2 tuan",
  "note": "Can tu van bo tri cay"
}
```

Success:

```json
{
  "id": "15",
  "message": "Đã ghi nhận yêu cầu báo giá. Chúng tôi sẽ liên hệ sớm."
}
```

## 7. Admin API

Base path: `/api/admin`

All routes below require admin JWT except `/api/admin/login`.

## 7.1 Admin Auth

### POST `/api/admin/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "12345678"
}
```

Success:

```json
{
  "token": "admin_jwt",
  "user": {
    "id": 99,
    "name": "Super Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## 7.2 Dashboard Stats

### GET `/api/admin/stats`

Success:

```json
{
  "totalOrders": 120,
  "totalProducts": 45,
  "totalCustomers": 88,
  "totalRevenue": 152000000
}
```

## 7.3 Admin Products

### GET `/api/admin/products`

Success:

```json
[
  {
    "id": 1,
    "title": "Monstera",
    "price": 350000,
    "originalPrice": 390000,
    "discount": "10%",
    "description": "Mo ta",
    "imageUrl": "https://...",
    "category": "Cay trong nha",
    "bio": "Thong tin them",
    "inStock": true,
    "planterOptions": [1, 2]
  }
]
```

### POST `/api/admin/products`

Request:

```json
{
  "title": "Monstera",
  "price": 350000,
  "originalPrice": 390000,
  "discount": "10%",
  "description": "Mo ta",
  "imageUrl": "https://...",
  "categoryId": 1,
  "bio": "Thong tin them",
  "inStock": true,
  "images": ["https://...", "https://..."],
  "careGuide": [
    { "title": "Tuoi nuoc", "content": "..." }
  ],
  "planterOptions": [1, 2]
}
```

Success:

```json
{
  "id": 1,
  "message": "Đã tạo sản phẩm."
}
```

### PUT `/api/admin/products/:id`

Same body as create.

Behavior:

- if `images` is present, backend replaces gallery images completely
- if `careGuide` is present, backend replaces care guides completely

### DELETE `/api/admin/products/:id`

Success:

```json
{
  "message": "Đã xóa sản phẩm."
}
```

## 7.4 Admin Orders

### GET `/api/admin/orders`

Success:

```json
[
  {
    "id": "PSTT-2026-00001",
    "date": "2026-05-28",
    "status": "pending",
    "customerName": "Nguyen Van A",
    "customerEmail": "a@example.com",
    "shippingAddress": "123 Nguyen Hue...",
    "total": 850000,
    "paymentMethod": "payos",
    "itemCount": 3
  }
]
```

### GET `/api/admin/orders/:id`

Returns order detail similar to customer order detail, plus no user ownership restriction.

Success:

```json
{
  "id": "PSTT-2026-00001",
  "date": "2026-05-28",
  "status": "shipping",
  "shippingAddress": "123 Nguyen Hue...",
  "paymentMethod": "payos",
  "subtotal": 820000,
  "shippingFee": 30000,
  "total": 850000,
  "trackingNumber": "GHN123456",
  "trackingProvider": "ghn",
  "trackingUrl": "https://donhang.ghn.vn/?order_code=GHN123456",
  "items": [
    {
      "id": "12",
      "title": "Monstera",
      "price": 410000,
      "quantity": 2,
      "image": "https://...",
      "planter": "Có (Kèm Chậu gốm trắng +60.000đ)"
    }
  ],
  "timeline": [
    { "status": "Đặt hàng thành công", "date": "2026-05-28 10:00:00", "done": true },
    { "status": "Đơn hàng đã được xác nhận", "date": "2026-05-28 10:20:00", "done": true }
  ]
}
```

### PATCH `/api/admin/orders/:id/status`

Request:

```json
{
  "status": "shipping",
  "timelineEntry": "Đơn hàng đã được bàn giao cho GHN",
  "trackingNumber": "GHN123456",
  "trackingProvider": "ghn",
  "trackingUrl": ""
}
```

Recommended status values used by system:

- `confirmed`
- `packing`
- `shipping`
- `delivered`
- `cancelled`

Tracking providers recognized by backend:

- `ghn`
- `ghtk`
- `viettelpost`
- `other`

Behavior:

- if `timelineEntry` omitted, backend auto-generates one for some statuses
- if `trackingUrl` omitted but provider and tracking number are present, backend auto-builds tracking URL

## 7.5 Admin Customers

### GET `/api/admin/customers`

Success:

```json
[
  {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "role": "customer",
    "orderCount": 3,
    "totalSpent": 2150000,
    "created_at": "2026-05-10"
  }
]
```

## 7.6 Admin Wholesale

### GET `/api/admin/wholesale-inquiries`

Query params:

- `status?: string`
- `q?: string`

Returns `WholesaleInquiry[]`.

### GET `/api/admin/wholesale-inquiries/:id`

Returns one `WholesaleInquiry`.

### PATCH `/api/admin/wholesale-inquiries/:id`

Request:

```json
{
  "status": "contacted",
  "assignedTo": "Admin 1",
  "adminNote": "Da goi dien"
}
```

Allowed status values:

- `new`
- `contacted`
- `qualified`
- `quoted`
- `won`
- `lost`
- `archived`

Success returns updated `WholesaleInquiry`.

## 7.7 Admin Categories

### GET `/api/admin/categories`

Success:

```json
[
  {
    "id": "1",
    "name": "Cay trong nha",
    "image": "https://...",
    "subcategories": ["De ban", "De san"]
  }
]
```

### POST `/api/admin/categories`

Request:

```json
{
  "name": "Cay trong nha",
  "image": "https://...",
  "subcategories": ["De ban", "De san"]
}
```

### PUT `/api/admin/categories/:id`

Same body as create.

If `subcategories` is present, backend replaces all subcategories.

### DELETE `/api/admin/categories/:id`

Success:

```json
{
  "message": "Đã xóa danh mục."
}
```

## 7.8 Admin Reviews

### GET `/api/admin/reviews`

Success:

```json
[
  {
    "id": 11,
    "productId": 1,
    "productTitle": "Monstera",
    "userName": "Nguyen Van A",
    "rating": 5,
    "title": "Rat dep",
    "content": "Cay dep",
    "verified": true,
    "createdAt": "2026-05-20",
    "visible": true,
    "images": ["https://..."],
    "tags": ["tuoi", "dep"]
  }
]
```

### PATCH `/api/admin/reviews/:id`

Request may contain either or both:

```json
{
  "verified": true,
  "visible": false
}
```

### DELETE `/api/admin/reviews/:id`

Success:

```json
{
  "message": "Đã xóa đánh giá."
}
```

## 7.9 Admin Planters And Accessories

### GET `/api/admin/planters`

Query params:

- `type?: "planter" | "accessory"`

Success:

```json
[
  {
    "id": "5",
    "name": "Chau gom trang",
    "material": "Gom",
    "accessoryBrand": "",
    "accessoryUses": null,
    "usageTags": [],
    "price": 90000,
    "imageUrl": "https://...",
    "inStock": true,
    "type": "planter",
    "sizes": ["S", "M"]
  }
]
```

### POST `/api/admin/planters`

Request:

```json
{
  "name": "Chau gom trang",
  "material": "Gom",
  "accessoryBrand": "",
  "usageTags": [],
  "price": 90000,
  "imageUrl": "https://...",
  "inStock": true,
  "type": "planter",
  "sizes": ["S", "M"]
}
```

Accessory example:

```json
{
  "name": "Binh xit tuoi",
  "material": "Dung cu cham cay",
  "accessoryBrand": "Gardena",
  "usageTags": ["Tuoi cay", "Cham soc la"],
  "price": 120000,
  "imageUrl": "https://...",
  "inStock": true,
  "type": "accessory",
  "sizes": []
}
```

### PUT `/api/admin/planters/:id`

Same shape as create.

If `sizes` is present, backend replaces sizes completely.

### DELETE `/api/admin/planters/:id`

Success:

```json
{
  "message": "Đã xóa chậu cây."
}
```

## 7.10 Admin Blog

### GET `/api/admin/blog`

Returns full `BlogPost[]`.

### POST `/api/admin/blog`

Request:

```json
{
  "title": "Tieu de",
  "image": "https://...",
  "excerpt": "Tom tat ngan",
  "content": "Markdown content",
  "category": "Tin tức",
  "readTime": "5 phút",
  "tags": ["cay", "news"],
  "featured": false,
  "date": "2026-05-28"
}
```

Notes:

- `title`, `content`, `category`, `image` are required
- `readTime` may be omitted, backend auto-computes
- `tags` may be array or comma-separated string

### PUT `/api/admin/blog/:id`

Same shape as create.

### DELETE `/api/admin/blog/:id`

Success:

```json
{
  "message": "Đã xóa bài viết."
}
```

### POST `/api/admin/blog/ai-draft`

AI blog draft generator.

Request:

```json
{
  "topic": "Cach cham monstera",
  "category": "Tin tức",
  "audience": "nguoi yeu cay canh",
  "tone": "than thien, chuyen mon de hieu",
  "keywords": "monstera, cham soc, tuoi nuoc",
  "brief": "Tap trung vao loi khuyen thuc te",
  "desiredLength": 1200
}
```

Success:

```json
{
  "draft": {
    "title": "Tieu de bai viet",
    "excerpt": "Tom tat ngan",
    "content": "Markdown content",
    "category": "Tin tức",
    "readTime": "6 phút",
    "tags": ["monstera", "cham soc"],
    "featured": false
  }
}
```

Frontend recommendation:

- build an AI draft form in admin blog editor
- allow user to preview AI output
- allow editing before save
- feed resulting draft directly into normal blog create/update form

## 8. Frontend Feature Map To Build

The frontend generated from this API should include all features below.

## 8.1 Public Storefront

- home page
- category browsing
- product listing page with:
  - category filter
  - keyword search
  - price filters
  - sale only toggle
  - sorting
  - pagination
- product detail page with:
  - image gallery
  - care guide
  - optional planter add-on selection from `planterOptions`
  - add to cart
  - buy now
  - wishlist toggle
  - related products
  - reviews display
  - review creation for eligible users
- planters listing page
- accessories listing page
- planter detail page
- accessory detail page
- blog listing page
- blog detail page
- blog category filter/search
- AI product advisor page
- wholesale inquiry page/form

## 8.2 Customer Features

- signup
- signin
- Google login
- Facebook login
- current user session restore
- profile page
- wishlist page
- address book CRUD
- cart
- checkout
- order success page
- order history
- order detail page
- cancel order action when eligible
- product advisor history page

## 8.3 Admin Features

- admin login
- dashboard stats
- products CRUD
- categories CRUD
- planters CRUD
- accessories CRUD using same admin planter API with `type=accessory`
- blog CRUD
- blog AI draft generation
- order list
- order detail
- update order status and tracking
- customer list
- review moderation
- wholesale inquiry CRM

## 8.4 Payment Return Pages

Required frontend routes:

- `/payment/vnpay-return`
- `/payment/payos-return`
- `/payment/payos-cancel`

Behavior:

- read query params from URL
- call verify endpoint
- display success or failure state
- show order id and next actions

## 9. Frontend Implementation Rules

## 9.1 Cart Rules

When adding items to cart:

- plain product without planter: use `product-${productId}-none`
- product with planter add-on: use `product-${productId}-planter-${planterId}`
- planter page add: use `planter-${planterId}`
- accessory page add: use `accessory-${accessoryId}`

Cart item display can store:

- `title`
- `image`
- `price`
- `planter` display string
- `quantity`

But backend remains pricing authority.

## 9.2 Checkout Rules

Checkout should send:

```json
{
  "items": [
    { "id": "product-12-planter-7", "quantity": 1 }
  ],
  "shippingAddress": "full address string",
  "shippingMethod": "standard",
  "paymentMethod": "cod"
}
```

Frontend may show estimated totals locally, but after order creation it should trust backend totals returned by `/api/orders`.

## 9.3 Wishlist Rules

- wishlist exists only for products
- not for planters/accessories
- use `/api/wishlist/:productId`

## 9.4 Review Rules

- only show review form to logged-in users
- ideally also check purchase eligibility from order history on frontend
- final source of truth is backend, which may return `403`
- review image upload should happen before submit using `/api/upload` or `/api/upload/multiple`

## 9.5 Upload Rules

- use `multipart/form-data`
- single file field name: `image`
- multiple file field name: `images`
- auth required

## 9.6 Blog Content Rules

- blog `content` is markdown
- render safely using markdown renderer
- support headings, lists, paragraphs

## 9.7 Tracking Rules

Tracking provider values:

- `ghn`
- `ghtk`
- `viettelpost`
- `other`

If `trackingUrl` exists, frontend should render a clickable tracking link.

## 10. Suggested Frontend Route Structure

Recommended customer/public routes:

- `/`
- `/shop`
- `/product/:id`
- `/planters`
- `/planters/:id`
- `/accessories`
- `/accessories/:id`
- `/blog`
- `/blog/:id`
- `/cart`
- `/checkout`
- `/order-success/:orderId`
- `/profile`
- `/wishlist`
- `/signin`
- `/signup`
- `/advisor`
- `/advisor/history`
- `/wholesale`
- `/payment/vnpay-return`
- `/payment/payos-return`
- `/payment/payos-cancel`

Recommended admin routes:

- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/categories`
- `/admin/planters`
- `/admin/accessories`
- `/admin/blog`
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/customers`
- `/admin/reviews`
- `/admin/wholesale`
- `/admin/wholesale/:id`

## 11. Suggested State Slices

Suggested frontend state organization:

- `authStore`
- `adminAuthStore`
- `cartStore`
- `wishlistStore`
- `checkoutState`
- `productFiltersState`
- `adminCmsState`

## 12. Important Non-Obvious Backend Behaviors

These are critical. Do not ignore them.

1. Product advisor works without login, but history only works with login.
2. Upload requires JWT for both users and admins.
3. Order create recalculates totals server-side.
4. Product cart ids can encode planter add-on selection.
5. Planters and accessories share the same public resource namespace.
6. PayOS and VNPay verification endpoints are public and must be called from return pages.
7. Blog content is markdown, not rich-text HTML.
8. Wishlist only applies to normal products.
9. Review eligibility is enforced by delivered-order check on backend.
10. Admin blog AI draft endpoint does not save article, it only generates draft JSON.

## 13. Minimum Acceptance Criteria For Generated Frontend

The generated frontend is considered complete only if it implements:

- customer auth with JWT persistence
- admin auth with separate persistence
- full store browsing and search
- product detail with planter add-on support
- cart and checkout
- VNPay and PayOS flows
- order history and order detail
- wishlist
- address book CRUD
- review create and review image upload
- AI product advisor and advisor history
- public blog
- wholesale form
- admin CMS for products, categories, planters/accessories, blog
- admin AI blog draft
- admin orders, reviews, customers, wholesale inquiry management

## 14. Final Instruction To The Frontend Builder AI

Build the frontend strictly against this contract.

Do not:

- invent missing fields
- rename API fields without adapter layer
- merge admin auth and customer auth into one token store
- assume client-side totals are authoritative
- assume wishlist works for accessories or planters
- assume blog content is HTML

Do:

- normalize numeric ids to strings in frontend state when useful
- show backend messages on error
- create dedicated return pages for both payment providers
- implement both public and admin AI features
- keep upload integration token-aware

