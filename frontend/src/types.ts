export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  description: string;
  images: string[];
  imageUrl: string; // primary thumbnail
  category: string;
  careGuide?: CareGuide[];
  bio?: string;
  inStock?: boolean;
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

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
