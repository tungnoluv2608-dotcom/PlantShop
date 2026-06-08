import { useEffect, useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  Tag,
  TicketPercent,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import type { AvailableVoucher, ShippingMethod, ValidateVoucherResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAvailableVouchers, validateVoucher } from "../api"

interface VoucherPickerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Array<{ id: string; quantity: number }>
  shippingMethod: ShippingMethod
  appliedCode?: string | null
  onApplied: (result: ValidateVoucherResponse) => void
}

function discountAccent(voucher: AvailableVoucher) {
  if (voucher.discountType === "freeship") {
    return { label: "Freeship", value: "0đ ship", icon: Truck }
  }
  if (voucher.eligible && voucher.savings > 0) {
    return { label: "Tiết kiệm", value: `-${formatVND(voucher.savings)}`, icon: TicketPercent }
  }
  return { label: voucher.discountLabel, value: "", icon: TicketPercent }
}

function VoucherTicket({
  voucher,
  selected,
  onSelect,
}: {
  voucher: AvailableVoucher
  selected: boolean
  onSelect: () => void
}) {
  const accent = discountAccent(voucher)
  const AccentIcon = accent.icon

  return (
    <button
      type="button"
      disabled={!voucher.eligible}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-xl border text-left transition-all",
        voucher.eligible
          ? selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/50 hover:shadow-sm"
          : "cursor-not-allowed border-border/60 opacity-60",
      )}
    >
      <div
        className={cn(
          "flex w-[72px] shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed px-2 py-4 text-center",
          voucher.eligible ? "bg-primary/8 text-primary" : "bg-muted/50 text-muted-foreground",
        )}
      >
        <AccentIcon className="size-4 opacity-80" />
        <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight">
          {accent.label}
        </span>
        {accent.value && (
          <span className="text-xs font-bold leading-tight">{accent.value}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-3 p-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-sm font-bold tracking-wide">{voucher.code}</span>
            {voucher.recommended && (
              <Badge className="h-5 bg-amber-500 px-1.5 text-[10px] hover:bg-amber-500">
                Đề xuất
              </Badge>
            )}
            {voucher.isClaimed && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                Đã lưu
              </Badge>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm font-medium">{voucher.name}</p>
          <p className="text-xs text-muted-foreground">{voucher.discountLabel}</p>
          {!voucher.eligible && voucher.reason && (
            <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-500">{voucher.reason}</p>
          )}
        </div>

        <div
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected && voucher.eligible
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 group-hover:border-primary/40",
          )}
        >
          {selected && voucher.eligible && <Check className="size-3" strokeWidth={3} />}
        </div>
      </div>
    </button>
  )
}

export function VoucherPickerSheet({
  open,
  onOpenChange,
  items,
  shippingMethod,
  appliedCode,
  onApplied,
}: VoucherPickerSheetProps) {
  const [manualCode, setManualCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string | null>(appliedCode ?? null)
  const [showIneligible, setShowIneligible] = useState(false)

  const availableQuery = useAvailableVouchers(
    open && items.length > 0 ? { items, shippingMethod } : null,
  )

  useEffect(() => {
    if (open) {
      setSelectedCode(appliedCode ?? null)
      setManualCode("")
      setShowIneligible(false)
    }
  }, [open, appliedCode])

  const { eligible, ineligible } = useMemo(() => {
    const vouchers = availableQuery.data?.vouchers ?? []
    return {
      eligible: vouchers.filter((v) => v.eligible),
      ineligible: vouchers.filter((v) => !v.eligible),
    }
  }, [availableQuery.data?.vouchers])

  const applyCode = async (code: string) => {
    const normalized = code.trim()
    if (!normalized) return

    setIsApplying(true)
    try {
      const result = await validateVoucher({
        code: normalized,
        items,
        shippingMethod,
      })
      onApplied(result)
      setSelectedCode(result.code)
      toast.success(result.message)
      onOpenChange(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsApplying(false)
    }
  }

  const handleApplySelected = async () => {
    if (manualCode.trim()) {
      await applyCode(manualCode)
      return
    }
    if (!selectedCode) {
      toast.error("Vui lòng chọn hoặc nhập mã voucher")
      return
    }
    await applyCode(selectedCode)
  }

  const handleApplyBest = async () => {
    const best = availableQuery.data?.recommended
    if (!best) {
      toast.error("Chưa có mã phù hợp cho đơn hàng này")
      return
    }
    setSelectedCode(best.code)
    await applyCode(best.code)
  }

  const recommended = availableQuery.data?.recommended

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[420px]"
      >
        <SheetHeader className="shrink-0 space-y-3 border-b px-5 py-5 pr-12">
          <div>
            <SheetTitle className="text-lg">Mã giảm giá</SheetTitle>
            <SheetDescription className="mt-1">
              {availableQuery.isLoading
                ? "Đang tìm mã phù hợp..."
                : eligible.length > 0
                  ? `${eligible.length} mã có thể áp dụng cho đơn này`
                  : "Chọn hoặc nhập mã cho đơn hàng"}
            </SheetDescription>
          </div>

          {recommended?.eligible && (
            <button
              type="button"
              onClick={() => void handleApplyBest()}
              disabled={isApplying}
              className="flex w-full items-center gap-3 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-primary/5 px-3.5 py-3 text-left transition-colors hover:from-amber-100/80 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-primary/10"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Áp dụng mã tốt nhất</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-foreground">{recommended.code}</span>
                  {recommended.savings > 0 && (
                    <> · tiết kiệm {formatVND(recommended.savings)}</>
                  )}
                </p>
              </div>
              {isApplying ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <span className="shrink-0 text-xs font-medium text-primary">Dùng ngay</span>
              )}
            </button>
          )}
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 px-5 py-4">
            {availableQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="size-7 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Đang tải danh sách voucher...</p>
              </div>
            ) : (
              <>
                {eligible.length > 0 && (
                  <section className="space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Có thể dùng ({eligible.length})
                    </p>
                    {eligible.map((voucher) => (
                      <VoucherTicket
                        key={String(voucher.id)}
                        voucher={voucher}
                        selected={selectedCode === voucher.code && !manualCode.trim()}
                        onSelect={() => {
                          setManualCode("")
                          setSelectedCode(voucher.code)
                        }}
                      />
                    ))}
                  </section>
                )}

                {ineligible.length > 0 && (
                  <section className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setShowIneligible((v) => !v)}
                      className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      <span>Chưa đủ điều kiện ({ineligible.length})</span>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          showIneligible && "rotate-180",
                        )}
                      />
                    </button>
                    {showIneligible &&
                      ineligible.map((voucher) => (
                        <VoucherTicket
                          key={String(voucher.id)}
                          voucher={voucher}
                          selected={false}
                          onSelect={() => {}}
                        />
                      ))}
                  </section>
                )}

                {!availableQuery.isLoading &&
                  eligible.length === 0 &&
                  ineligible.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <TicketPercent className="size-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Hiện chưa có voucher nào đang hoạt động.
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="shrink-0 border-t bg-background px-5 py-4">
          <div className="w-full space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Tag className="size-3.5" />
                Hoặc nhập mã khác
              </div>
              <Input
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value.toUpperCase())
                  if (e.target.value.trim()) setSelectedCode(null)
                }}
                placeholder="VD: PLANT10"
                className="font-mono tracking-wide"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void handleApplySelected()
                  }
                }}
              />
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => void handleApplySelected()}
              disabled={isApplying || (!selectedCode && !manualCode.trim())}
            >
              {isApplying ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang áp dụng...
                </>
              ) : (
                "Áp dụng mã"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}