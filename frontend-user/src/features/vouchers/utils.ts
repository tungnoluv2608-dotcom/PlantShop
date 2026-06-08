import type { VoucherDiscountType, VoucherPromotion, WalletVoucher } from "@/types"

export function formatVoucherDiscountLabel(input: {
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscount?: number | null
}): string {
  if (input.discountType === "freeship") return "Miễn phí vận chuyển"
  if (input.discountType === "percent") {
    const cap = input.maxDiscount
      ? ` (tối đa ${input.maxDiscount.toLocaleString("vi-VN")}đ)`
      : ""
    return `Giảm ${input.discountValue}%${cap}`
  }
  return `Giảm ${input.discountValue.toLocaleString("vi-VN")}đ`
}

export function isVoucherUsable(
  voucher: Pick<VoucherPromotion, "canUse"> | Pick<WalletVoucher, "status">,
): boolean {
  if ("canUse" in voucher && voucher.canUse === false) return false
  if ("status" in voucher && voucher.status !== "active") return false
  return true
}