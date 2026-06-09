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
  stockQuantity: number
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
  stockQuantity: number
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
  stockQuantity: number
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
  stockQuantity: number
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
  userId?: number | string
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
  discountAmount?: number
  voucherCode?: string | null
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

export type CustomerSegment = "vip" | "loyal" | "new" | "regular" | "no_orders"

export interface Customer {
  id: number | string
  name: string
  email: string
  role: string
  phone?: string | null
  orderCount: number
  deliveredOrderCount?: number
  totalSpent: number
  lastOrderDate?: string | null
  created_at: string
  segment?: CustomerSegment
}

export interface CustomerAddress {
  id: number | string
  label: string
  fullName: string
  phone: string
  province: string
  district: string
  ward?: string | null
  addressLine: string
  isDefault: boolean
  createdAt?: string
}

export interface CustomerOrderSummary {
  id: string
  date: string
  status: OrderStatus
  total: number
  paymentMethod: string
  itemCount: number
}

export interface CustomerReviewSummary {
  id: number | string
  productId: number | string
  productTitle: string
  rating: number
  title: string
  content: string
  verified: boolean
  visible: boolean
  createdAt: string
}

export interface CustomerDetail extends Customer {
  addresses: CustomerAddress[]
  orders: CustomerOrderSummary[]
  reviews: CustomerReviewSummary[]
  wishlistCount: number
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

export interface WholesaleInterestItem {
  id: string
  name?: string
  title?: string
}

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
  interestedCategories: WholesaleInterestItem[]
  interestedProducts: WholesaleInterestItem[]
  status: WholesaleStatus
  source: string
  assignedTo: string
  assignedAdminId?: string
  adminNote: string
  orderId?: string
  createdAt: string
  updatedAt: string
  contactedAt?: string | null
  closedAt?: string | null
}

export interface WholesaleUpdatePayload {
  status?: WholesaleStatus
  assignedTo?: string
  assignedAdminId?: string
  adminNote?: string
}

export interface WholesaleAdminOption {
  id: string
  name: string
  email: string
}

export interface WholesaleActivity {
  id: string
  inquiryId: string
  actorId?: string | null
  actorName: string
  action: string
  details: string
  createdAt: string
}

export interface WholesaleListResponse {
  items: WholesaleInquiry[]
  total: number
  page: number
  pageSize: number
  statusCounts: Partial<Record<WholesaleStatus | "all", number>>
}

export interface WholesaleCreateOrderItem {
  productId: string
  quantity: number
}

export interface WholesaleCreateOrderPayload {
  items?: WholesaleCreateOrderItem[]
  paymentMethod?: string
  shippingMethod?: string
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

export type VoucherDiscountType = "percent" | "fixed" | "freeship"
export type VoucherAppliesTo = "all" | "category" | "product"

export interface VoucherScope {
  scopeType: "category" | "product"
  scopeId: number
}

export interface Voucher {
  id: number | string
  code: string
  name: string
  description?: string | null
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscount?: number | null
  minOrderValue: number
  usageLimit?: number | null
  usagePerUser: number
  startsAt: string
  expiresAt: string
  isActive: boolean
  appliesTo: VoucherAppliesTo
  scopes?: VoucherScope[]
  usedCount?: number
  createdAt?: string
}

export interface VoucherPayload {
  code: string
  name: string
  description?: string | null
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscount?: number | null
  minOrderValue: number
  usageLimit?: number | null
  usagePerUser: number
  startsAt: string
  expiresAt: string
  isActive: boolean
  appliesTo: VoucherAppliesTo
  scopes: VoucherScope[]
}

export interface VoucherRedemption {
  id: number | string
  orderId?: string | null
  discountAmount: number
  redeemedAt: string
  customerName: string
  customerEmail: string
  orderStatus?: string | null
  orderTotal?: number | null
}

export interface VoucherRedemptionsReport {
  voucher: Pick<Voucher, "id" | "code" | "name">
  scopes: VoucherScope[]
  summary: {
    totalUsed: number
    totalDiscount: number
  }
  redemptions: VoucherRedemption[]
}

export interface ShippingZone {
  id: number
  name: string
  province: string | null
  district: string | null
  standardFee: number
  expressFee: number
  samedayFee: number
  allowsSameday: boolean
  freeShippingThreshold: number | null
  priority: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ShippingZonePayload {
  name: string
  province: string | null
  district: string | null
  standardFee: number
  expressFee: number
  samedayFee: number
  allowsSameday: boolean
  freeShippingThreshold: number | null
  priority: number
  isActive: boolean
}
