import { Link, useNavigate } from "react-router"
import { Check, ShoppingBag, TicketPercent, Truck } from "lucide-react"
import { toast } from "sonner"
import type { VoucherPromotion } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/common/EmptyState"
import { formatVND, formatDate } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"
import { useClaimVoucher, useVoucherPromotions, useVoucherWallet } from "../api"
import { isVoucherUsable } from "../utils"

function PromoCard({
  promo,
  isAuthenticated,
  onClaim,
  isClaiming,
}: {
  promo: VoucherPromotion
  isAuthenticated: boolean
  onClaim: () => void
  isClaiming: boolean
}) {
  const isFreeship = promo.discountType === "freeship"
  const canUse = isVoucherUsable(promo)

  return (
    <article
      className={cn(
        "flex overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        promo.isClaimed ? "border-border" : "border-primary/25",
      )}
    >
      <div
        className={cn(
          "flex w-24 shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed px-3 py-5 text-center",
          promo.isClaimed ? "bg-muted/50 text-muted-foreground" : "bg-primary/10 text-primary",
        )}
      >
        {isFreeship ? <Truck className="size-5" /> : <TicketPercent className="size-5" />}
        <span className="text-[10px] font-bold uppercase leading-tight tracking-wide">
          {isFreeship ? "Freeship" : "Giảm giá"}
        </span>
        <span className="text-xs font-semibold leading-tight">{promo.discountLabel}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-lg font-bold tracking-wide">{promo.code}</h3>
            {promo.isClaimed && (
              <Badge variant="secondary" className="gap-1">
                <Check className="size-3" />
                Đã lưu
              </Badge>
            )}
            {promo.isClaimed && !canUse && promo.claimStatus === "used" && (
              <Badge variant="outline">Đã dùng</Badge>
            )}
          </div>
          <p className="mt-1 font-medium">{promo.name}</p>
          {promo.description && (
            <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {promo.minOrderValue > 0 && <span>Đơn từ {formatVND(promo.minOrderValue)}</span>}
            <span>HSD {formatDate(promo.expiresAt)}</span>
          </div>
          {!canUse && promo.statusMessage && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">{promo.statusMessage}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {canUse && promo.isClaimed && (
            <Button asChild size="sm">
              <Link to={`/checkout?voucher=${encodeURIComponent(promo.code)}`}>Dùng ngay</Link>
            </Button>
          )}
          {!promo.isClaimed && canUse && isAuthenticated && (
            <Button size="sm" onClick={onClaim} disabled={isClaiming}>
              Lưu mã
            </Button>
          )}
          {!promo.isClaimed && canUse && !isAuthenticated && (
            <Button asChild size="sm" variant="outline">
              <Link to="/signin" state={{ from: "/vouchers" }}>
                Đăng nhập để lưu
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

function PromoGrid({
  promotions,
  isAuthenticated,
  onClaim,
  isClaiming,
}: {
  promotions: VoucherPromotion[]
  isAuthenticated: boolean
  onClaim: (id: number | string) => void
  isClaiming: boolean
}) {
  if (promotions.length === 0) {
    return (
      <EmptyState
        icon={TicketPercent}
        title="Không có mã nào"
        description="Hiện chưa có voucher phù hợp trong mục này."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {promotions.map((promo) => (
        <PromoCard
          key={String(promo.id)}
          promo={promo}
          isAuthenticated={isAuthenticated}
          onClaim={() => onClaim(promo.id)}
          isClaiming={isClaiming}
        />
      ))}
    </div>
  )
}

export function VouchersPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const promotionsQuery = useVoucherPromotions(true)
  const walletQuery = useVoucherWallet({ enabled: isAuthenticated })
  const claimVoucher = useClaimVoucher()

  const promotions = promotionsQuery.data ?? []
  const unclaimed = promotions.filter((p) => !p.isClaimed)
  const claimed = promotions.filter((p) => p.isClaimed)
  const savedCount = walletQuery.data?.length ?? claimed.length

  const handleClaim = (id: number | string) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: "/vouchers" } })
      return
    }
    claimVoucher.mutate(id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const isLoading = promotionsQuery.isLoading || (isAuthenticated && walletQuery.isLoading)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <TicketPercent className="size-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">Ưu đãi</span>
          </div>
          <h1 className="text-3xl font-semibold">Voucher & Khuyến mãi</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Lưu mã vào kho cá nhân và áp dụng nhanh khi thanh toán. Mã mới được cập nhật tại đây.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/profile?tab=vouchers">
                Kho của tôi ({savedCount})
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/checkout">Thanh toán</Link>
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link to="/signin" state={{ from: "/vouchers" }}>
              Đăng nhập để lưu mã
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={TicketPercent}
          title="Chưa có voucher đang hoạt động"
          description="Quay lại sau để nhận ưu đãi mới từ PlantShop."
          action={
            <Button asChild>
              <Link to="/shop">Mua sắm ngay</Link>
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả ({promotions.length})</TabsTrigger>
            <TabsTrigger value="unclaimed">Có thể lưu ({unclaimed.length})</TabsTrigger>
            {isAuthenticated && (
              <TabsTrigger value="claimed">Đã lưu ({claimed.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all">
            <PromoGrid
              promotions={promotions}
              isAuthenticated={isAuthenticated}
              onClaim={handleClaim}
              isClaiming={claimVoucher.isPending}
            />
          </TabsContent>

          <TabsContent value="unclaimed">
            <PromoGrid
              promotions={unclaimed}
              isAuthenticated={isAuthenticated}
              onClaim={handleClaim}
              isClaiming={claimVoucher.isPending}
            />
          </TabsContent>

          {isAuthenticated && (
            <TabsContent value="claimed">
              <PromoGrid
                promotions={claimed}
                isAuthenticated={isAuthenticated}
                onClaim={handleClaim}
                isClaiming={claimVoucher.isPending}
              />
            </TabsContent>
          )}
        </Tabs>
      )}

      <div className="mt-10 rounded-xl border border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <ShoppingBag className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Sau khi lưu mã, vào{" "}
            <Link to="/checkout" className="font-medium text-primary underline-offset-2 hover:underline">
              thanh toán
            </Link>{" "}
            để chọn voucher hoặc dùng <strong>Áp dụng mã tốt nhất</strong> tự động.
          </p>
        </div>
      </div>
    </div>
  )
}