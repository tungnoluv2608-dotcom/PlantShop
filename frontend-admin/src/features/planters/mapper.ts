import type { PlanterPayload } from "@/types"
import type { PlanterFormValues } from "./schema"

export function toPlanterPayload(values: PlanterFormValues): PlanterPayload {
  const isAccessory = values.type === "accessory"

  return {
    name: values.name,
    material: values.material,
    accessoryBrand: isAccessory ? values.accessoryBrand : "",
    usageTags: isAccessory ? values.usageTags : [],
    price: values.price,
    imageUrl: values.imageUrl,
    inStock: values.inStock,
    stockQuantity: values.stockQuantity,
    type: values.type,
    sizes: isAccessory ? [] : values.sizes,
  }
}