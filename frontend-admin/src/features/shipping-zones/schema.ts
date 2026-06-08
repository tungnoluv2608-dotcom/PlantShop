import { z } from "zod"

export const shippingZoneSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên vùng"),
  province: z.string(),
  district: z.string(),
  standardFee: z.number().min(0, "Phí không hợp lệ"),
  expressFee: z.number().min(0, "Phí không hợp lệ"),
  samedayFee: z.number().min(0, "Phí không hợp lệ"),
  allowsSameday: z.boolean(),
  freeShippingThreshold: z.union([z.literal(""), z.number().min(0)]),
  priority: z.number().int(),
  isActive: z.boolean(),
})

export type ShippingZoneFormValues = z.infer<typeof shippingZoneSchema>