import axios from "axios";
import type { Product, Category, BlogPost } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeType?: string;
  page?: number;
  pageSize?: number;
}

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    const params: Record<string, string | number | undefined> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.pageSize = filters.pageSize;

    const res = await api.get("/products", { params });
    return res.data;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await api.get(`/products/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getRelatedProducts(id: string, limit = 4): Promise<Product[]> {
    const res = await api.get(`/products/${id}/related`, { params: { limit } });
    return res.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get("/categories");
    return res.data;
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    const res = await api.get("/blog");
    return res.data;
  },

  async searchProducts(
    query: string,
    limit = 5
  ): Promise<Pick<Product, "id" | "title" | "category">[]> {
    const res = await api.get("/products/search", { params: { q: query, limit } });
    return res.data;
  },
};
