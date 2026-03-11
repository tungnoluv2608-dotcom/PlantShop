import { products, categories, blogPosts } from "../data/mockData";
import type { Product, Category, BlogPost } from "../types";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeType?: string; // "planter" | "combo" | "flowers" | "service"
  page?: number;
  pageSize?: number;
}

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    await delay(300);

    let filtered = [...products];

    if (filters?.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    const total = filtered.length;
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 9;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return { products: paginated, total };
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    return products.find((p) => p.id === id) ?? null;
  },

  async getRelatedProducts(id: string, limit = 4): Promise<Product[]> {
    await delay(200);
    const target = products.find((p) => p.id === id);
    if (!target) return products.slice(0, limit);

    return products
      .filter((p) => p.id !== id && p.category === target.category)
      .concat(products.filter((p) => p.id !== id && p.category !== target.category))
      .slice(0, limit);
  },

  async getCategories(): Promise<Category[]> {
    await delay(150);
    return categories;
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    await delay(200);
    return blogPosts;
  },

  async searchProducts(query: string, limit = 5): Promise<Pick<Product, "id" | "title" | "category">[]> {
    await delay(100);
    const q = query.toLowerCase();
    return products
      .filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, limit)
      .map((p) => ({ id: p.id, title: p.title, category: p.category }));
  },
};
