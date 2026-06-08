export function isInStock(stockQuantity?: number | null, inStock?: boolean): boolean {
  if (typeof stockQuantity === "number") return stockQuantity > 0
  return inStock !== false
}

export function getMaxOrderQuantity(stockQuantity?: number | null, inStock?: boolean): number {
  if (!isInStock(stockQuantity, inStock)) return 0
  if (typeof stockQuantity === "number") return Math.max(0, stockQuantity)
  return 99
}

export function clampOrderQuantity(quantity: number, maxQuantity: number): number {
  if (maxQuantity <= 0) return 1
  return Math.min(Math.max(1, quantity), maxQuantity)
}

export function formatStockLabel(stockQuantity?: number | null, inStock?: boolean): string {
  if (!isInStock(stockQuantity, inStock)) return "Hết hàng"
  if (typeof stockQuantity === "number" && stockQuantity <= 10) {
    return `Còn ${stockQuantity} sản phẩm`
  }
  return "Còn hàng"
}