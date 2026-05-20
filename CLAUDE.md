# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlantWeb is an e-commerce platform for plants, planters, and accessories. It has a React/Vite frontend (`frontend/`) and Express.js backend (`backend/`).

## Commands

### Backend (Express + MS SQL Server)
```bash
cd backend
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
npm run seed     # Seed database
```

### Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm run dev      # Development server on port 5173
npm run build    # Production build
npm run lint     # Lint with ESLint
npm run preview  # Preview production build
```

## Architecture

### Backend Structure
```
backend/src/
├── server.js           # Express app entry, CORS, static routes
├── libs/db.js          # MS SQL Server connection pool (mssql)
├── controllers/         # Route handlers (auth, product, order, blog, etc.)
├── routes/             # Express routers (one per resource)
├── middlewares/        # authMiddleware, adminMiddleware, errorHandler
```

### Frontend Structure
```
frontend/src/
├── App.tsx             # React Router route definitions
├── pages/              # Route page components (Home, Shop, Cart, Checkout, etc.)
├── pages/admin/        # Admin dashboard pages
├── components/         # Reusable UI (home/, layout/, admin/, ui/)
├── services/           # API clients (apiService.ts, authService.ts, etc.)
├── stores/            # Zustand state stores (authStore, cartStore, wishlistStore, adminStore)
├── hooks/             # Custom hooks (useImageUpload)
├── data/              # Mock data and utilities
```

### State Management
- **Zustand stores** in `frontend/src/stores/`:
  - `authStore` - user authentication (token stored in localStorage key `plantweb-auth`)
  - `adminStore` - admin auth (token in `pap-admin-auth`)
  - `cartStore` - shopping cart
  - `wishlistStore` - user wishlist
- JWT tokens are automatically attached to requests via Axios interceptor in `apiService.ts`

### Database
- MS SQL Server via `mssql` package
- Connection config in `backend/src/libs/db.js` and `.env`
- Table names typically plural (Products, Orders, Categories)

### API Design
- RESTful API on `/api/*` endpoints
- Auth: `/api/auth` (signin, signup, google-oauth)
- Products: `/api/products`
- Orders: `/api/orders` (with VNPay payment integration)
- Planters: `/api/planters` (type: planter | accessory)
- Admin: `/api/admin/*` (protected, separate admin routes)

### Admin Features
- AI blog draft generation via OpenRouter (configured in backend .env)
- Product/Order/Customer/Category/Review/Planter management
- All admin endpoints use adminMiddleware

### Payments
- Supports: COD, VNPay, MoMo, ZaloPay, bank transfer
- VNPay integration with return URL at `/payment/vnpay-return`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn, Zustand |
| Backend | Express.js, Node.js (CommonJS) |
| Database | MS SQL Server |
| Auth | JWT (jsonwebtoken), bcryptjs, Google OAuth |
| Payments | VNPay, MoMo, ZaloPay |
| AI | OpenRouter API (for blog drafts) |