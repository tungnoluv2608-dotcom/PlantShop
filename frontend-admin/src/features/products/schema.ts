import { z } from "zod"

export const careGuideItemSchema = z.object({
  title: z.string().min(1, "Nhập tiêu đề"),
  content: z.string().min(1, "Nhập nội dung"),
})

export const productSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  price: z.number().min(0, "Giá không hợp lệ"),
  originalPrice: z.number().min(0).optional(),
  discount: z.string(),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  imageUrl: z.string().min(1, "Vui lòng tải ảnh chính"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  bio: z.string(),
  inStock: z.boolean(),
  images: z.array(z.string()),
  careGuide: z.array(careGuideItemSchema),
  planterOptions: z.array(z.string()),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const PRODUCT_FORM_DEFAULTS: ProductFormValues = {
  title: "",
  price: 0,
  originalPrice: undefined,
  discount: "",
  description: "",
  imageUrl: "",
  categoryId: "",
  bio: "",
  inStock: true,
  images: [],
  careGuide: [],
  planterOptions: [],
}
