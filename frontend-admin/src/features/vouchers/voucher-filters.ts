import type { Voucher } from "@/types"

export type TriState = "all" | "yes" | "no"

export interface VoucherFilterState {
  [key: string]: string
  q: string
  status: "all" | "active" | "inactive" | "expired" | "scheduled"
  discountType: "all" | "percent" | "fixed" | "freeship"
  sort: "newest" | "code_asc" | "usage_desc" | "expires_asc"
}

export const VOUCHER_FILTER_DEFAULTS: VoucherFilterState = {
  q: "",
  status: "all",
  discountType: "all",
  sort: "newest",
}

function voucherStatus(voucher: Voucher, now = Date.now()): string {
  const starts = new Date(voucher.startsAt).getTime()
  const expires = new Date(voucher.expiresAt).getTime()
  if (!voucher.isActive) return "inactive"
  if (now > expires) return "expired"
  if (now < starts) return "scheduled"
  return "active"
}

export function filterVouchers(vouchers: Voucher[], filters: VoucherFilterState): Voucher[] {
  const q = filters.q.trim().toLowerCase()
  const now = Date.now()

  let result = vouchers.filter((voucher) => {
    if (q) {
      const haystack = `${voucher.code} ${voucher.name} ${voucher.description ?? ""}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.discountType !== "all" && voucher.discountType !== filters.discountType) {
      return false
    }
    if (filters.status !== "all" && voucherStatus(voucher, now) !== filters.status) {
      return false
    }
    return true
  })

  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case "code_asc":
        return a.code.localeCompare(b.code, "vi")
      case "usage_desc":
        return (b.usedCount ?? 0) - (a.usedCount ?? 0)
      case "expires_asc":
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
      default:
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    }
  })

  return result
}

export function formatDiscountLabel(voucher: Voucher): string {
  if (voucher.discountType === "freeship") return "Miễn phí ship"
  if (voucher.discountType === "percent") {
    const cap = voucher.maxDiscount ? ` (tối đa ${voucher.maxDiscount.toLocaleString("vi-VN")}đ)` : ""
    return `Giảm ${voucher.discountValue}%${cap}`
  }
  return `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`
}