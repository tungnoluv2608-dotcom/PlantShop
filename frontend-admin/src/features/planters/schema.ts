import { z } from "zod"

export const planterSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  material: z.string().min(1, "Vui lòng nhập chất liệu"),
  accessoryBrand: z.string(),
  usageTags: z.array(z.string()),
  price: z.number().min(0, "Giá không hợp lệ"),
  imageUrl: z.string().min(1, "Vui lòng tải ảnh"),
  inStock: z.boolean(),
  stockQuantity: z.number().int().min(0, "Số lượng không hợp lệ"),
  type: z.enum(["planter", "accessory"]),
  sizes: z.array(z.string()),
})

export type PlanterFormValues = z.infer<typeof planterSchema>

export function planterDefaults(type: "planter" | "accessory"): PlanterFormValues {
  return {
    name: "",
    material: "",
    accessoryBrand: "",
    usageTags: [],
    price: 0,
    imageUrl: "",
    inStock: true,
    stockQuantity: 10,
    type,
    sizes: [],
  }
}
