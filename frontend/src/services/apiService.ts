import axios from "axios";
import type { Order, Review, Product, WholesaleInquiry, WholesaleInquiryStatus } from "../types";
import {
  clearAdminSessionStorage,
  clearUserSessionStorage,
  getAdminToken,
  getUserToken,
  isAdminApiRequest,
  isUploadApiRequest,
} from "./authStorage";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: BASE });
let hasHandledUnauthorized = false;

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const requestUrl = String(config.url || "");
  const userToken = getUserToken();
  const adminToken = getAdminToken();
  const token = isAdminApiRequest(requestUrl)
    ? adminToken
    : isUploadApiRequest(requestUrl)
      ? userToken || adminToken
      : userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isAuthRequest = [
      "/auth/signin",
      "/auth/signup",
      "/auth/google",
      "/auth/facebook",
      "/admin/login",
    ].some((path) => requestUrl.startsWith(path));

    if (status === 401 && !isAuthRequest && !hasHandledUnauthorized && typeof window !== "undefined") {
      hasHandledUnauthorized = true;
      if (isAdminApiRequest(requestUrl) || (isUploadApiRequest(requestUrl) && !getUserToken() && getAdminToken())) {
        clearAdminSessionStorage();
      } else {
        clearUserSessionStorage();
      }
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

// ── Orders ──────────────────────────────────────────────────────
export const orderApi = {
  create: (body: {
    items: { id: string; title: string; price: number; quantity: number; image: string; planter: string }[];
    shippingAddress: string;
    shippingMethod: string;
    paymentMethod: string;
    subtotal: number;
    shippingFee: number;
    total: number;
  }) => api.post<{ orderId: string; message: string }>("/orders", body).then((r) => r.data),

  getMyOrders: () => api.get<Order[]>("/orders").then((r) => r.data),

  getOrderById: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),

  createVnpayPaymentUrl: (orderId: string) =>
    api.post<{ paymentUrl: string }>(`/orders/${orderId}/vnpay-url`).then((r) => r.data),

  createPayosPaymentUrl: (orderId: string) =>
    api.post<{ checkoutUrl: string; qrCode: string; paymentLinkId: string }>(`/orders/${orderId}/payos-url`).then((r) => r.data),

  verifyPayosReturn: (params: URLSearchParams) =>
    api.get<{ success: boolean; orderId?: string; message?: string; status?: string }>("/orders/payos/verify", { params }).then((r) => r.data),

  verifyVnpayReturn: (params: URLSearchParams) =>
    api.get<{ success: boolean; orderId?: string; message?: string }>("/orders/vnpay/verify", { params }).then((r) => r.data),

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
  getById: (id: string, type?: "planter" | "accessory") =>
    api.get(`/planters/${id}`, { params: type ? { type } : undefined }).then((r) => r.data),
};

// ── Wishlist ──────────────────────────────────────────────────
export const wishlistApi = {
  list: () => api.get<Product[]>("/wishlist").then((r) => r.data),

  add: (productId: string) =>
    api.post(`/wishlist/${productId}`).then((r) => r.data),

  remove: (productId: string) =>
    api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

// ── Wholesale ─────────────────────────────────────────────────
export const wholesaleApi = {
  createInquiry: (body: {
    company: string;
    contact: string;
    phone: string;
    email: string;
    quantity?: string;
    type?: string;
    location?: string;
    budget?: string;
    timeline?: string;
    note?: string;
  }) => api.post<{ id: string; message: string }>("/wholesale-inquiries", body).then((r) => r.data),
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
  updateOrderStatus: (
    id: string,
    body: {
      status: string;
      timelineEntry?: string;
      trackingNumber?: string;
      trackingProvider?: string | null;
      trackingUrl?: string;
    }
  ) => api.patch(`/admin/orders/${id}/status`, body).then((r) => r.data),
  getOrderDetail: (id: string) => api.get(`/admin/orders/${id}`).then((r) => r.data),

  // Customers
  listCustomers: () => api.get("/admin/customers").then((r) => r.data),

  // Wholesale inquiries
  listWholesaleInquiries: (params?: { status?: string; q?: string }) =>
    api.get<WholesaleInquiry[]>("/admin/wholesale-inquiries", { params }).then((r) => r.data),
  getWholesaleInquiryDetail: (id: string | number) =>
    api.get<WholesaleInquiry>(`/admin/wholesale-inquiries/${id}`).then((r) => r.data),
  updateWholesaleInquiry: (id: string | number, body: {
    status: WholesaleInquiryStatus;
    assignedTo?: string;
    adminNote?: string;
  }) => api.patch<WholesaleInquiry>(`/admin/wholesale-inquiries/${id}`, body).then((r) => r.data),

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
  generateBlogDraft: (body: {
    topic: string;
    category?: string;
    audience?: string;
    tone?: string;
    keywords?: string;
    brief?: string;
    desiredLength?: number;
  }) => api.post<{ draft: { title: string; excerpt: string; content: string; category: string; readTime: string; tags: string[]; featured?: boolean } }>("/admin/blog/ai-draft", body).then((r) => r.data),
  createBlogPost: (body: object) => api.post("/admin/blog", body).then((r) => r.data),
  updateBlogPost: (id: string | number, body: object) => api.put(`/admin/blog/${id}`, body).then((r) => r.data),
  deleteBlogPost: (id: string | number) => api.delete(`/admin/blog/${id}`).then((r) => r.data),
};
