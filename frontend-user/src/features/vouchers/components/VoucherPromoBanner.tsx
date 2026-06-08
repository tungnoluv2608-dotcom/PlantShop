import { Link } from "react-router"
import { TicketPercent, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAuthStore } from "@/stores/authStore"
import { useClaimVoucher, useVoucherPromotions } from "../api"
import { isVoucherUsable } from "../utils"

interface VoucherPromoBannerProps {
  checkoutLink?: string
  compact?: boolean
}

export function VoucherPromoBanner({
  checkoutLink = "/checkout",
  compact = false,
}: VoucherPromoBannerProps) {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const { data: promotions, isLoading } = useVoucherPromotions(isAuthenticated)
  const claimVoucher = useClaimVoucher()

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TicketPercent className="size-5 text-primary" />
            <div>
              <p className="font-medium">Nhận ưu đãi voucher</p>
              <p className="text-sm text-muted-foreground">Đăng nhập để lưu mã và dùng khi thanh toán</p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link to="/signin">Đăng nhập</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <Skeleton className={compact ? "h-20 w-full" : "h-28 w-full"} />
  }

  if (!promotions || promotions.length === 0) {
    return null
  }

  const featured = promotions.slice(0, compact ? 2 : 3)

  const handleClaim = (id: number | string) => {
    claimVoucher.mutate(id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TicketPercent className="size-5 text-primary" />
          <p className="font-semibold">Ưu đãi đang diễn ra</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/vouchers">
            Xem tất cả <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {featured.map((promo) => (
          <div
            key={String(promo.id)}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card/80 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold">{promo.code}</span>
                {promo.isClaimed && <Badge variant="secondary">Đã lưu</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {promo.discountLabel}
                {promo.minOrderValue > 0 && ` · Đơn từ ${formatVND(promo.minOrderValue)}`}
              </p>
            </div>
            <div className="flex gap-2">
              {!promo.isClaimed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleClaim(promo.id)}
                  disabled={claimVoucher.isPending}
                >
                  Lưu mã
                </Button>
              )}
              {isVoucherUsable(promo) && (
                <Button asChild size="sm">
                  <Link to={`${checkoutLink}?voucher=${encodeURIComponent(promo.code)}`}>
                    Dùng ngay
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}