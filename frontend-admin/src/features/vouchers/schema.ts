import { z } from "zod"

export const voucherSchema = z
  .object({
    code: z.string().min(1, "Mã voucher bắt buộc").max(50),
    name: z.string().min(1, "Tên voucher bắt buộc").max(255),
    description: z.string().max(500),
    discountType: z.enum(["percent", "fixed", "freeship"]),
    discountValue: z.number().min(0),
    maxDiscount: z.union([z.number().min(0), z.literal("")]).optional(),
    minOrderValue: z.number().min(0),
    usageLimit: z.union([z.number().int().min(1), z.literal("")]).optional(),
    usagePerUser: z.number().int().min(1),
    startsAt: z.string().min(1, "Thời gian bắt đầu bắt buộc"),
    expiresAt: z.string().min(1, "Thời gian kết thúc bắt buộc"),
    isActive: z.boolean(),
    appliesTo: z.enum(["all", "category", "product"]),
    scopeIds: z.array(z.string()),
  })
  .superRefine((values, ctx) => {
    if (values.discountType === "percent" && (values.discountValue <= 0 || values.discountValue > 100)) {
      ctx.addIssue({
        code: "custom",
        message: "Phần trăm giảm phải từ 1 đến 100",
        path: ["discountValue"],
      })
    }
    if (values.discountType === "fixed" && values.discountValue <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Số tiền giảm phải lớn hơn 0",
        path: ["discountValue"],
      })
    }
    if (values.startsAt && values.expiresAt && values.startsAt >= values.expiresAt) {
      ctx.addIssue({
        code: "custom",
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
        path: ["expiresAt"],
      })
    }
    if (values.appliesTo !== "all" && values.scopeIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Chọn ít nhất một danh mục hoặc sản phẩm",
        path: ["scopeIds"],
      })
    }
  })

export type VoucherFormValues = z.infer<typeof voucherSchema>

export function toDatetimeLocalValue(iso: string | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}