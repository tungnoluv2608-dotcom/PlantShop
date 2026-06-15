import type { Voucher } from "@/types"
import { parseWallClockDate } from "@/lib/format"

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

export type VoucherLifecycleStatus = "inactive" | "expired" | "scheduled" | "active"

export function getVoucherLifecycleStatus(
  voucher: Voucher,
  now = Date.now(),
): VoucherLifecycleStatus {
  const starts = parseWallClockDate(voucher.startsAt)?.getTime()
  const expires = parseWallClockDate(voucher.expiresAt)?.getTime()
  if (!starts || !expires) return "inactive"
  if (!voucher.isActive) return "inactive"
  if (now > expires) return "expired"
  if (now < starts) return "scheduled"
  return "active"
}

export function getVoucherPeriodHint(voucher: Voucher, now = Date.now()): string | null {
  const status = getVoucherLifecycleStatus(voucher, now)
  const starts = parseWallClockDate(voucher.startsAt)?.getTime()
  const expires = parseWallClockDate(voucher.expiresAt)?.getTime()
  if (!starts || !expires) return null

  const formatDelta = (ms: number, future: boolean) => {
    const abs = Math.abs(ms)
    const days = Math.floor(abs / 86_400_000)
    const hours = Math.floor(abs / 3_600_000)
    const minutes = Math.max(1, Math.floor(abs / 60_000))

    if (days >= 1) return future ? `Bắt đầu sau ${days} ngày` : `Còn ${days} ngày`
    if (hours >= 1) return future ? `Bắt đầu sau ${hours} giờ` : `Còn ${hours} giờ`
    return future ? `Bắt đầu sau ${minutes} phút` : `Còn ${minutes} phút`
  }

  if (status === "scheduled") return formatDelta(starts - now, true)
  if (status === "active") return formatDelta(expires - now, false)
  if (status === "expired") return "Đã kết thúc"
  return null
}

export function getVoucherPeriodProgress(voucher: Voucher, now = Date.now()): number | null {
  if (getVoucherLifecycleStatus(voucher, now) !== "active") return null
  const starts = parseWallClockDate(voucher.startsAt)?.getTime()
  const expires = parseWallClockDate(voucher.expiresAt)?.getTime()
  if (!starts || !expires || expires <= starts) return null

  const ratio = (now - starts) / (expires - starts)
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
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
    if (filters.status !== "all" && getVoucherLifecycleStatus(voucher, now) !== filters.status) {
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
        return (
          (parseWallClockDate(a.expiresAt)?.getTime() ?? 0) -
          (parseWallClockDate(b.expiresAt)?.getTime() ?? 0)
        )
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