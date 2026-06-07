import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên danh mục"),
  image: z.string(),
  subcategories: z.array(z.string()),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
