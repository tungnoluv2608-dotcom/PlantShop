import { cn } from "@/lib/utils"
import { formatVoucherPeriod } from "@/lib/format"
import type { Voucher } from "@/types"
import {
  getVoucherLifecycleStatus,
  getVoucherPeriodHint,
  getVoucherPeriodProgress,
} from "../voucher-filters"

interface VoucherPeriodCellProps {
  voucher: Pick<Voucher, "startsAt" | "expiresAt" | "isActive">
}

export function VoucherPeriodCell({ voucher }: VoucherPeriodCellProps) {
  const period = formatVoucherPeriod(voucher.startsAt, voucher.expiresAt)
  const status = getVoucherLifecycleStatus(voucher)
  const hint = getVoucherPeriodHint(voucher)
  const progress = getVoucherPeriodProgress(voucher)

  return (
    <div className="min-w-[9.5rem]">
      <p className="text-sm font-medium tabular-nums leading-snug">{period.primary}</p>
      {period.secondary && (
        <p className="text-xs text-muted-foreground">{period.secondary}</p>
      )}
      {hint && (
        <p
          className={cn(
            "mt-0.5 text-xs",
            status === "active" && "text-emerald-600",
            status === "scheduled" && "text-amber-600",
            status === "expired" && "text-muted-foreground",
            status === "inactive" && "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      )}
      {progress != null && (
        <div
          className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
          title={`Đã qua ${progress}% thời hạn`}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}