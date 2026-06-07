import { z } from "zod"

export const ORDER_STATUSES = [
  "confirmed",
  "packing",
  "shipping",
  "delivered",
  "cancelled",
] as const

export const TRACKING_PROVIDERS = ["ghn", "ghtk", "viettelpost", "other"] as const

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "packing",
    "shipping",
    "delivered",
    "cancelled",
    "returning",
  ]),
  timelineEntry: z.string(),
  trackingNumber: z.string(),
  trackingProvider: z.enum(["ghn", "ghtk", "viettelpost", "other"]),
  trackingUrl: z.string(),
})

export type OrderStatusFormValues = z.infer<typeof orderStatusSchema>

export const PROVIDER_LABELS: Record<(typeof TRACKING_PROVIDERS)[number], string> = {
  ghn: "Giao Hàng Nhanh",
  ghtk: "Giao Hàng Tiết Kiệm",
  viettelpost: "Viettel Post",
  other: "Khác",
}
