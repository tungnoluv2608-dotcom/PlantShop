/**
 * API data shapes — mirrors backend contract in backend/API_DOCS_FRONTEND_AI.md §5.
 * Do not invent fields. Ids are normalized to string in frontend state.
 */

export interface User {
  id: string
  name: string
  email: string
  role?: "customer" | "admin"
}

export interface CareGuide {
  title: string
  content: string
}

export interface Product {
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
  stockQuantity?: number
  careGuide?: CareGuide[]
  planterOptions?: Array<string | number>
  isFavorite?: boolean
  favoriteCreatedAt?: string
}

export type PlanterType = "planter" | "accessory"

export interface Planter {
  id: string
  name: string
  material: string
  accessoryBrand?: string
  usageTags?: string[]
  price: number
  imageUrl: string
  sizes: string[]
  inStock: boolean
  stockQuantity?: number
  type: PlanterType
}

export interface Category {
  id: string
  name: string
  image: string
  subcategories: string[]
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

export interface BlogCategory {
  name: string
  total: number
}

export interface Review {
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

export interface ShippingAddress {
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

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returning"

export type TrackingProvider = "ghn" | "ghtk" | "viettelpost" | "other"

export interface Order {
  id: string
  date: string
  status: OrderStatus
  items: OrderItem[]
  shippingAddress: string
  paymentMethod: string
  recipientPhone?: string | null
  subtotal: number
  shippingFee: number
  discountAmount?: number
  voucherCode?: string | null
  total: number
  trackingNumber?: string | null
  trackingProvider?: TrackingProvider | null
  trackingUrl?: string | null
  timeline: OrderTimeline[]
}

// ── Catalog query/response ────────────────────────────────────
export type ProductSort =
  | "default"
  | "sale"
  | "trending"
  | "best-selling"
  | "price-asc"
  | "price-desc"

export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
  sort?: ProductSort
  saleOnly?: boolean
}

export interface ProductListResponse {
  products: Product[]
  total: number
}

export interface ProductSearchResult {
  id: string
  title: string
  category: string
}

// ── AI advisor chat ───────────────────────────────────────────
export type AdvisorChatRole = "user" | "assistant"

export interface AdvisorChatMessage {
  role: AdvisorChatRole
  content: string
}

export interface AdvisorRecommendation {
  product: Product
  reason: string
  fitTags: string[]
}

export interface AdvisorChatResponse {
  message: string
  recommendations: AdvisorRecommendation[]
}

export interface AdvisorChatEntry extends AdvisorChatMessage {
  id: string
  recommendations?: AdvisorRecommendation[]
}

// ── Order creation ────────────────────────────────────────────
export type ShippingMethod = "standard" | "express" | "sameday"
export type PaymentMethod = "cod" | "payos" | "vnpay"

export interface CreateOrderItem {
  id: string
  quantity: number
}

export interface CreateOrderRequest {
  items: CreateOrderItem[]
  shippingAddress: string
  shippingMethod: ShippingMethod
  paymentMethod: PaymentMethod
  voucherCode?: string
  recipientName?: string
  recipientPhone?: string
  province?: string
  district?: string
  ward?: string
  addressLine?: string
}

export interface CreateOrderResponse {
  orderId: string
  message: string
  subtotal: number
  shippingFee: number
  discountAmount?: number
  voucherCode?: string | null
  total: number
}

export type VoucherDiscountType = "percent" | "fixed" | "freeship"

export interface ValidateVoucherRequest {
  code: string
  items: CreateOrderItem[]
  shippingMethod: ShippingMethod
  province: string
  district?: string | null
  ward?: string | null
}

export interface ShippingQuoteMethod {
  method: ShippingMethod
  fee: number
  available: boolean
  reason: string | null
}

export interface ShippingQuoteResponse {
  subtotal: number
  shippingMethod: ShippingMethod
  shippingFee: number
  total: number
  zone: {
    id: number | null
    name: string
    allowsSameday: boolean
    freeShippingThreshold: number
  }
  methods: ShippingQuoteMethod[]
  allowsSameday: boolean
}

export interface ValidateVoucherResponse {
  valid: boolean
  message: string
  code: string
  voucherName: string
  discountType: VoucherDiscountType
  subtotal: number
  eligibleSubtotal: number
  discountAmount: number
  shippingFee: number
  total: number
}

export interface VoucherPromotion {
  id: number | string
  code: string
  name: string
  description?: string | null
  discountType: VoucherDiscountType
  discountLabel: string
  minOrderValue: number
  expiresAt: string
  isClaimed: boolean
  canUse?: boolean
  claimStatus?: WalletVoucherStatus | null
  statusMessage?: string | null
}

export type WalletVoucherStatus = "active" | "expired" | "inactive" | "depleted" | "used"

export interface WalletVoucher {
  id: number | string
  code: string
  name: string
  description?: string | null
  discountType: VoucherDiscountType
  discountLabel: string
  minOrderValue: number
  expiresAt: string
  claimedAt: string
  status: WalletVoucherStatus
  statusMessage?: string | null
}

export interface AvailableVoucher {
  id: number | string
  code: string
  name: string
  description?: string | null
  discountType: VoucherDiscountType
  discountLabel: string
  minOrderValue: number
  appliesTo: string
  expiresAt: string
  isClaimed: boolean
  eligible: boolean
  reason?: string | null
  discountAmount: number
  shippingFee: number
  total: number
  savings: number
  recommended: boolean
}

export interface AvailableVouchersResponse {
  vouchers: AvailableVoucher[]
  recommended: AvailableVoucher | null
}

export interface PaymentVerifyResult {
  success: boolean
  orderId: string
  status?: string
  message?: string
}
