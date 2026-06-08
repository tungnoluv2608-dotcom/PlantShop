import { Link } from "react-router"
import { TicketPercent, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/EmptyState"
import { formatVND, formatDate } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import { useClaimVoucher, useVoucherPromotions, useVoucherWallet } from "../api"
import { isVoucherUsable } from "../utils"

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-600 hover:bg-emerald-600">Sẵn sàng</Badge>
    case "used":
      return <Badge variant="secondary">Đã dùng hết</Badge>
    case "depleted":
      return <Badge variant="destructive">Hết lượt</Badge>
    case "expired":
      return <Badge variant="outline">Hết hạn</Badge>
    default:
      return <Badge variant="outline">Không khả dụng</Badge>
  }
}

export function VouchersTab() {
  const walletQuery = useVoucherWallet()
  const promotionsQuery = useVoucherPromotions()
  const claimVoucher = useClaimVoucher()

  const handleClaim = (id: number | string) => {
    claimVoucher.mutate(id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  if (walletQuery.isLoading || promotionsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const wallet = walletQuery.data ?? []
  const promotions = (promotionsQuery.data ?? []).filter((promo) => !promo.isClaimed)

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mã đã lưu</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/checkout">Dùng khi thanh toán</Link>
          </Button>
        </div>

        {wallet.length === 0 ? (
          <EmptyState
            icon={TicketPercent}
            title="Chưa có voucher nào"
            description="Lưu mã từ khu ưu đãi bên dưới để dùng nhanh hơn khi thanh toán."
          />
        ) : (
          <div className="space-y-3">
            {wallet.map((voucher) => (
              <div
                key={String(voucher.id)}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold">{voucher.code}</span>
                      {statusBadge(voucher.status)}
                    </div>
                    <p className="mt-1 font-medium">{voucher.name}</p>
                    <p className="text-sm text-muted-foreground">{voucher.discountLabel}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Hết hạn {formatDate(voucher.expiresAt)}
                    </p>
                    {voucher.statusMessage && (
                      <p className="mt-2 text-xs text-amber-700">{voucher.statusMessage}</p>
                    )}
                  </div>
                  {isVoucherUsable(voucher) && (
                    <Button asChild size="sm">
                      <Link to={`/checkout?voucher=${encodeURIComponent(voucher.code)}`}>
                        Dùng ngay
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Có thể lưu thêm</h2>
        {promotions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hiện không còn mã công khai mới.</p>
        ) : (
          <div className="space-y-3">
            {promotions.map((promo) => (
              <div
                key={String(promo.id)}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4"
              >
                <div>
                  <p className="font-mono font-semibold">{promo.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {promo.discountLabel}
                    {promo.minOrderValue > 0 && ` · Đơn từ ${formatVND(promo.minOrderValue)}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleClaim(promo.id)}
                  disabled={claimVoucher.isPending}
                >
                  Lưu mã
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <ShoppingBag className="mt-0.5 size-4 shrink-0" />
          <p>
            Tại bước thanh toán, bạn có thể chọn mã từ danh sách hoặc dùng{" "}
            <strong>Áp dụng mã tốt nhất</strong> để tiết kiệm tự động.
          </p>
        </div>
      </div>
    </div>
  )
}