/**
 * Cart item id encoding — the ONLY place that knows how cart line ids map to
 * backend source entities. See API_DOCS_FRONTEND_AI.md §9.1.
 *
 * Patterns:
 *   product, no planter      -> product-${productId}-none
 *   product, with planter    -> product-${productId}-planter-${planterId}
 *   planter line             -> planter-${planterId}
 *   accessory line           -> accessory-${accessoryId}
 */

export type CartSource =
  | { kind: "product"; productId: string; planterId?: string }
  | { kind: "planter"; planterId: string }
  | { kind: "accessory"; accessoryId: string }

export function encodeCartId(source: CartSource): string {
  switch (source.kind) {
    case "product":
      return source.planterId
        ? `product-${source.productId}-planter-${source.planterId}`
        : `product-${source.productId}-none`
    case "planter":
      return `planter-${source.planterId}`
    case "accessory":
      return `accessory-${source.accessoryId}`
  }
}

export function decodeCartId(id: string): CartSource | null {
  if (id.startsWith("product-")) {
    const rest = id.slice("product-".length)
    const noneMatch = rest.match(/^(.+)-none$/)
    if (noneMatch) return { kind: "product", productId: noneMatch[1] }
    const planterMatch = rest.match(/^(.+)-planter-(.+)$/)
    if (planterMatch) {
      return { kind: "product", productId: planterMatch[1], planterId: planterMatch[2] }
    }
    // bare numeric product id fallback
    return { kind: "product", productId: rest }
  }
  if (id.startsWith("planter-")) {
    return { kind: "planter", planterId: id.slice("planter-".length) }
  }
  if (id.startsWith("accessory-")) {
    return { kind: "accessory", accessoryId: id.slice("accessory-".length) }
  }
  // plain product id like "12"
  if (/^\d+$/.test(id)) return { kind: "product", productId: id }
  return null
}
