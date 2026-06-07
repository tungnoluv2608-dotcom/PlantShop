import { z } from "zod"

export const wholesaleSchema = z.object({
  company: z.string().min(1, "Vui lòng nhập tên công ty"),
  contact: z.string().min(1, "Vui lòng nhập người liên hệ"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  quantity: z.string().min(1, "Vui lòng nhập số lượng"),
  type: z.string(),
  location: z.string(),
  budget: z.string(),
  timeline: z.string(),
  note: z.string(),
})

export type WholesaleFormValues = z.infer<typeof wholesaleSchema>
