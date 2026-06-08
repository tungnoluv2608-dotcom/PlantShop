import { z } from "zod"

export const addressSchema = z.object({
  label: z.string().min(1, "Vui lòng nhập nhãn địa chỉ"),
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành"),
  district: z.string().optional(),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ chi tiết"),
  isDefault: z.boolean(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

/** Compose a single-line shipping address string for the order payload. */
export function formatAddressLine(a: {
  address: string
  ward?: string
  district: string
  province: string
}): string {
  return [a.address, a.ward, a.district, a.province].filter(Boolean).join(", ")
}
