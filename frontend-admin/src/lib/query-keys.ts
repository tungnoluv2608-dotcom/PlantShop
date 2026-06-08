/** Centralized TanStack Query key factory — prevents cache-key drift. */

export const queryKeys = {
  stats: ["admin", "stats"] as const,

  products: {
    all: ["admin", "products"] as const,
    detail: (id: string) => ["admin", "products", id] as const,
  },
  categories: ["admin", "categories"] as const,

  planters: {
    all: (type?: string) => ["admin", "planters", type ?? "all"] as const,
    detail: (id: string) => ["admin", "planters", "detail", id] as const,
  },

  blog: {
    all: ["admin", "blog"] as const,
    detail: (id: string) => ["admin", "blog", id] as const,
  },

  orders: {
    all: ["admin", "orders"] as const,
    detail: (id: string) => ["admin", "orders", id] as const,
  },

  customers: ["admin", "customers"] as const,
  reviews: ["admin", "reviews"] as const,

  wholesale: {
    all: (params?: object) =>
      ["admin", "wholesale", params ?? {}] as const,
    detail: (id: string) => ["admin", "wholesale", "detail", id] as const,
    activities: (id: string) => ["admin", "wholesale", "activities", id] as const,
    admins: ["admin", "wholesale", "admins"] as const,
  },

  printSettings: ["admin", "print-settings"] as const,

  vouchers: {
    all: ["admin", "vouchers"] as const,
    detail: (id: string) => ["admin", "vouchers", id] as const,
    redemptions: (id: string) => ["admin", "vouchers", id, "redemptions"] as const,
  },

  shippingZones: {
    all: ["admin", "shipping-zones"] as const,
  },

  locations: {
    provinces: ["locations", "provinces"] as const,
    wards: (provinceCode: number | null) =>
      ["locations", "wards", provinceCode] as const,
  },
} as const
