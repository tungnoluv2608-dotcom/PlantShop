import { z } from "zod"

export const printSettingsSchema = z.object({
  shopName: z.string().min(1, "Vui lòng nhập tên shop").max(255),
  shopPhone: z.string().min(8, "Số điện thoại không hợp lệ").max(50),
  shopAddress: z.string().min(1, "Vui lòng nhập địa chỉ shop").max(500),
  defaultNote: z.string().max(500),
  logoUrl: z.string().max(1000),
})

export type PrintSettingsFormValues = z.infer<typeof printSettingsSchema>