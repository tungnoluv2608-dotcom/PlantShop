/** All API types for the admin panel, mirroring backend/API_DOCS_FRONTEND_AI.md. */

export interface AdminUser {
  id: string | number
  name: string
  email: string
  role: "admin"
}

export interface CareGuide {
  title: string
  content: string
}

/** Product row from GET /api/admin/products (list shape). */
export interface AdminProduct {
  id: number | string
  title: string
  price: number
  originalPrice?: number | null
  discount?: string | null
  description: string
  imageUrl: string
  category: string
  bio?: string | null
  inStock: boolean
  planterOptions?: Array<string | number>
}

/** Full product detail (storefront shape) used to prefill the edit form. */
export interface ProductDetail extends AdminProduct {
  images: string[]
  careGuide: CareGuide[]
}

export interface ProductPayload {
  title: string
  price: number
  originalPrice?: number | null
  discount?: string | null
  description: string
  imageUrl: string
  categoryId: number | string
  bio?: string | null
  inStock: boolean
  images: string[]
  careGuide: CareGuide[]
  planterOptions: Array<number | string>
}

export interface Category {
  id: string
  name: string
  image: string
  subcategories: string[]
}

export interface CategoryPayload {
  name: string
  image: string
  subcategories: string[]
}

export type PlanterType = "planter" | "accessory"

export interface Planter {
  id: string
  name: string
  material: string
  accessoryBrand?: string
  accessoryUses?: string | null
  usageTags?: string[]
  price: number
  imageUrl: string
  sizes: string[]
  inStock: boolean
  type: PlanterType
}

export interface PlanterPayload {
  name: string
  material: string
  accessoryBrand?: string
  usageTags: string[]
  price: number
  imageUrl: string
  inStock: boolean
  type: PlanterType
  sizes: string[]
}

export interface BlogPost {
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

export interface BlogPayload {
  title: string
  image: string
  excerpt: string
  content: string
  category: string
  readTime?: string
  tags: string[]
  featured: boolean
  date?: string
}

export interface BlogAiDraftRequest {
  topic: string
  category: string
  audience?: string
  tone?: string
  keywords?: string
  brief?: string
  desiredLength?: number
}

export interface BlogAiDraft {
  title: string
  excerpt: string
  content: string
  category: string
  readTime: string
  tags: string[]
  featured: boolean
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returning"

export type TrackingProvider = "ghn" | "ghtk" | "viettelpost" | "other"
export type ShippingMethod = "standard" | "express" | "sameday"

export interface AdminOrderRow {
  id: string
  date: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  shippingAddress: string
  recipientName?: string | null
  recipientPhone?: string | null
  shippingMethod?: ShippingMethod | null
  trackingNumber?: string | null
  trackingProvider?: TrackingProvider | null
  total: number
  paymentMethod: string
  itemCount: number
}

export interface OrderItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
  planter: string
}

export interface OrderTimeline {
  status: string
  date: string
  done: boolean
}

export interface AdminOrderDetail {
  id: string
  date: string
  status: OrderStatus
  shippingAddress: string
  paymentMethod: string
  subtotal: number
  shippingFee: number
  total: number
  trackingNumber?: string | null
  trackingProvider?: TrackingProvider | null
  trackingUrl?: string | null
  shippingMethod?: ShippingMethod | null
  recipientName?: string | null
  recipientPhone?: string | null
  province?: string | null
  district?: string | null
  ward?: string | null
  addressLine?: string | null
  internalNote?: string | null
  weightGrams?: number | null
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  items: OrderItem[]
  timeline: OrderTimeline[]
}

export interface OrderNotePayload {
  internalNote: string
}

export interface OrderStatusPayload {
  status: OrderStatus
  timelineEntry?: string
  trackingNumber?: string
  trackingProvider?: TrackingProvider
  trackingUrl?: string
}

export interface Customer {
  id: number | string
  name: string
  email: string
  role: string
  orderCount: number
  totalSpent: number
  created_at: string
}

export interface AdminReview {
  id: number | string
  productId: number | string
  productTitle: string
  userName: string
  rating: number
  title: string
  content: string
  verified: boolean
  createdAt: string
  visible: boolean
  images: string[]
  tags: string[]
}

export interface ReviewModerationPayload {
  verified?: boolean
  visible?: boolean
}

export type WholesaleStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "won"
  | "lost"
  | "archived"

export interface WholesaleInquiry {
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
  status: WholesaleStatus
  source: string
  assignedTo: string
  adminNote: string
  createdAt: string
  updatedAt: string
  contactedAt?: string | null
  closedAt?: string | null
}

export interface WholesaleUpdatePayload {
  status?: WholesaleStatus
  assignedTo?: string
  adminNote?: string
}

export interface DashboardStats {
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  totalRevenue: number
}

export interface ShopPrintConfig {
  shopName: string
  shopPhone: string
  shopAddress: string
  defaultNote?: string | null
  logoUrl?: string | null
}

export interface PrintSettings extends ShopPrintConfig {
  updatedAt?: string | null
}

export interface PrintSettingsPayload {
  shopName: string
  shopPhone: string
  shopAddress: string
  defaultNote?: string
  logoUrl?: string
}

export interface UploadResult {
  url: string
}

export interface MessageResponse {
  message: string
}
