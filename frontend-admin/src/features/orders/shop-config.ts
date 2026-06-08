import type { ShopPrintConfig } from "@/types"

/** Fallback when print settings API is unavailable. */
export function getFallbackPrintSettings(): ShopPrintConfig {
  return {
    shopName: import.meta.env.VITE_SHOP_NAME ?? "PlantShop",
    shopPhone: import.meta.env.VITE_SHOP_PHONE ?? "0900 000 000",
    shopAddress:
      import.meta.env.VITE_SHOP_ADDRESS ??
      "Cập nhật địa chỉ shop trong Cài đặt in ấn",
    defaultNote: null,
    logoUrl: null,
  }
}