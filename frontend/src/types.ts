export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  description: string;
  images: string[];
  imageUrl: string;
  category: string;
  careGuide?: CareGuide[];
  bio?: string;
  inStock?: boolean;
  planterOptions?: Array<string | number>;
  isFavorite?: boolean;
  favoriteCreatedAt?: string;
}

export interface CareGuide {
  title: string;
  content: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  planter: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  subcategories?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  image: string;
  excerpt?: string;
  date?: string;
  category?: string;
  readTime?: string;
  content?: string;
  tags?: string[];
  featured?: boolean;
}

export interface BlogCategory {
  name: string;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface Planter {
  id: string;
  name: string;
  material: string;
  accessoryBrand?: string;
  usageTags?: string[];
  price: number;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
  type: 'planter' | 'accessory';
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OrderTimeline {
  status: string;
  date: string;
  done: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "confirmed" | "packing" | "shipping" | "delivered" | "cancelled" | "returning";
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  trackingNumber?: string;
  timeline: OrderTimeline[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  date: string;
  helpful: number;
  verified: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note: string;
  shippingMethod: "standard" | "express" | "sameday";
  paymentMethod: "cod" | "momo" | "vnpay" | "zalopay" | "bank";
}

export interface ShippingAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward?: string;
  address: string;
  isDefault: boolean;
}
