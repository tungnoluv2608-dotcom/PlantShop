import axios from "axios";
import type { Order, Review, Product } from "../types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: BASE });

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  // Try admin token first, then user token
  const adminToken = (() => { try { return JSON.parse(localStorage.getItem("pap-admin-auth") || "{}").state?.token; } catch { return null; } })();
  const userToken = (() => { try { return JSON.parse(localStorage.getItem("plantweb-auth") || "{}").state?.token; } catch { return null; } })();
  const token = adminToken || userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Orders ──────────────────────────────────────────────────────
export const orderApi = {
  create: (body: {
    items: { id: string; title: string; price: number; quantity: number; image: string; planter: string }[];
    shippingAddress: string;
    paymentMethod: string;
    subtotal: number;
    shippingFee: number;
    total: number;
  }) => api.post<{ orderId: string; message: string }>("/orders", body).then((r) => r.data),

  getMyOrders: () => api.get<Order[]>("/orders").then((r) => r.data),

  getOrderById: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),

  cancel: (id: string) => api.patch(`/orders/${id}/cancel`).then((r) => r.data),
};

// ── Reviews ────────────────────────────────────────────────────
export const reviewApi = {
  getByProduct: (productId: string) =>
    api.get<Review[]>(`/reviews?productId=${productId}`).then((r) => r.data),

  create: (body: { productId: string; rating: number; title: string; content: string; tags?: string[]; images?: string[] }) =>
    api.post("/reviews", body).then((r) => r.data),
};

// ── Planters ───────────────────────────────────────────────────
export const planterApi = {
  list: (type?: "planter" | "accessory") =>
    api.get("/planters", { params: type ? { type } : undefined }).then((r) => r.data),
};

// ── Wishlist ──────────────────────────────────────────────────
export const wishlistApi = {
  list: () => api.get<Product[]>("/wishlist").then((r) => r.data),

  add: (productId: string) =>
    api.post(`/wishlist/${productId}`).then((r) => r.data),

  remove: (productId: string) =>
    api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

// ── Admin ──────────────────────────────────────────────────────
export const adminApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
      "/admin/login",
      { email, password }
    ).then((r) => r.data),

  getStats: () =>
    api.get<{ totalOrders: number; totalProducts: number; totalCustomers: number; totalRevenue: number }>(
      "/admin/stats"
    ).then((r) => r.data),

  // Products
  listProducts: () => api.get("/admin/products").then((r) => r.data),
  createProduct: (body: object) => api.post("/admin/products", body).then((r) => r.data),
  updateProduct: (id: string | number, body: object) => api.put(`/admin/products/${id}`, body).then((r) => r.data),
  deleteProduct: (id: string | number) => api.delete(`/admin/products/${id}`).then((r) => r.data),

  // Orders
  listOrders: () => api.get("/admin/orders").then((r) => r.data),
  updateOrderStatus: (id: string, status: string, timelineEntry?: string) =>
    api.patch(`/admin/orders/${id}/status`, { status, timelineEntry }).then((r) => r.data),
  getOrderDetail: (id: string) => api.get(`/admin/orders/${id}`).then((r) => r.data),

  // Customers
  listCustomers: () => api.get("/admin/customers").then((r) => r.data),

  // Categories
  listCategories: () => api.get("/admin/categories").then((r) => r.data),
  createCategory: (body: object) => api.post("/admin/categories", body).then((r) => r.data),
  updateCategory: (id: string | number, body: object) => api.put(`/admin/categories/${id}`, body).then((r) => r.data),
  deleteCategory: (id: string | number) => api.delete(`/admin/categories/${id}`).then((r) => r.data),

  // Reviews
  listReviews: () => api.get("/admin/reviews").then((r) => r.data),
  updateReview: (id: string | number, body: object) => api.patch(`/admin/reviews/${id}`, body).then((r) => r.data),
  deleteReview: (id: string | number) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),

  // Planters
  listPlanters: (type?: "planter" | "accessory") =>
    api.get("/admin/planters", { params: type ? { type } : undefined }).then((r) => r.data),
  createPlanter: (body: object) => api.post("/admin/planters", body).then((r) => r.data),
  updatePlanter: (id: string | number, body: object) => api.put(`/admin/planters/${id}`, body).then((r) => r.data),
  deletePlanter: (id: string | number) => api.delete(`/admin/planters/${id}`).then((r) => r.data),

  // Blog
  listBlog: () => api.get("/admin/blog").then((r) => r.data),
  createBlogPost: (body: object) => api.post("/admin/blog", body).then((r) => r.data),
  updateBlogPost: (id: string | number, body: object) => api.put(`/admin/blog/${id}`, body).then((r) => r.data),
  deleteBlogPost: (id: string | number) => api.delete(`/admin/blog/${id}`).then((r) => r.data),
};
