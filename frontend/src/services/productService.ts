import type { Product, Category, BlogPost } from "../types";
import { api } from "./apiService";

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeType?: string;
  page?: number;
  pageSize?: number;
  sort?: "sale" | "trending" | "best-selling" | "price-asc" | "price-desc";
  saleOnly?: boolean;
}

export interface BlogFilters {
  category?: string;
  search?: string;
  featured?: boolean;
}

export interface BlogCategoryOption {
  name: string;
  total: number;
}

export interface PlantAdvisorPreferences {
  budget: number;
  lightLevel: "low" | "medium" | "bright";
  hasPets: boolean;
  priority: "easy-care" | "decor";
  customPrompt?: string;
}

export interface PlantAdvisorRecommendation {
  product: Product;
  reason: string;
  fitTags: string[];
}

export interface PlantAdvisorResponse {
  summary: string;
  recommendations: PlantAdvisorRecommendation[];
}

export interface PlantAdvisorHistoryEntry extends PlantAdvisorPreferences {
  id: number;
  summary: string;
  createdAt: string;
  recommendations: PlantAdvisorRecommendation[];
}

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.page) params.page = filters.page;
    if (filters?.pageSize) params.pageSize = filters.pageSize;
    if (filters?.sort) params.sort = filters.sort;
    if (filters?.saleOnly !== undefined) params.saleOnly = filters.saleOnly;

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

  async getBlogPosts(filters?: BlogFilters): Promise<BlogPost[]> {
    const params: Record<string, string | boolean | undefined> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;
    if (filters?.featured !== undefined) params.featured = filters.featured;

    const res = await api.get("/blog", { params });
    return res.data;
  },

  async getBlogPostById(id: string): Promise<BlogPost | null> {
    try {
      const res = await api.get(`/blog/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getBlogCategories(): Promise<BlogCategoryOption[]> {
    const res = await api.get("/blog/categories");
    return res.data;
  },

  async searchProducts(
    query: string,
    limit = 5
  ): Promise<Pick<Product, "id" | "title" | "category">[]> {
    const res = await api.get("/products/search", { params: { q: query, limit } });
    return res.data;
  },

  async getAdvisorRecommendations(body: PlantAdvisorPreferences): Promise<PlantAdvisorResponse> {
    const res = await api.post("/products/advisor", body);
    return res.data;
  },

  async getAdvisorHistory(): Promise<PlantAdvisorHistoryEntry[]> {
    const res = await api.get("/products/advisor/history");
    return res.data;
  },
};
