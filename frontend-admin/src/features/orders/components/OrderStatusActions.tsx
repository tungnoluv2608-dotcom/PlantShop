import { useEffect, useState } from "react"
import { Loader2, Package, Truck, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-client"
import type { AdminOrderDetail, OrderStatus, OrderStatusPayload, TrackingProvider } from "@/types"
import { useUpdateOrderStatus } from "../api"
import {
  WORKFLOW_STEPS,
  getActionHint,
  getPrimaryActionLabel,
  getWorkflowStepIndex,
  isTerminalStatus,
} from "../order-workflow"
import { PROVIDER_LABELS, TRACKING_PROVIDERS } from "../schema"

type PanelMode = "default" | "handoff" | "edit-tracking"

interface OrderStatusActionsProps {
  order: AdminOrderDetail
}

function buildTrackingPayload(
  status: OrderStatus,
  trackingProvider: TrackingProvider,
  trackingNumber: string
): OrderStatusPayload {
  const normalized = trackingNumber.trim()
  return {
    status,
    trackingNumber: normalized,
    trackingProvider,
  }
}

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const updateStatus = useUpdateOrderStatus()
  const [mode, setMode] = useState<PanelMode>("default")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [trackingProvider, setTrackingProvider] = useState<TrackingProvider>("ghn")
  const [trackingNumber, setTrackingNumber] = useState("")

  useEffect(() => {
    setMode("default")
    setTrackingProvider(order.trackingProvider ?? "ghn")
    setTrackingNumber(order.trackingNumber ?? "")
  }, [order.id, order.status, order.trackingProvider, order.trackingNumber])

  const stepIndex = getWorkflowStepIndex(order.status)
  const primaryLabel = getPrimaryActionLabel(order.status)
  const actionHint = getActionHint(order.status)
  const terminal = isTerminalStatus(order.status)
  const showTrackingForm = mode === "handoff" || mode === "edit-tracking"

  const submitUpdate = (payload: OrderStatusPayload, onSuccess?: () => void) => {
    updateStatus.mutate(
      { id: order.id, payload },
      {
        onSuccess: (res) => {
          toast.success(res.message)
          setMode("default")
          onSuccess?.()
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  }

  const handlePrimaryAction = () => {
    if (order.status === "confirmed") {
      submitUpdate({ status: "packing" })
      return
    }

    if (order.status === "packing") {
      setMode("handoff")
      return
    }

    if (order.status === "shipping") {
      submitUpdate({ status: "delivered" })
    }
  }

  const handleConfirmHandoff = () => {
    if (!trackingNumber.trim()) {
      toast.error("Vui lòng nhập mã vận đơn trước khi giao cho đơn vị VC.")
      return
    }
    submitUpdate(buildTrackingPayload("shipping", trackingProvider, trackingNumber))
  }

  const handleSaveTracking = () => {
    if (!trackingNumber.trim()) {
      toast.error("Mã vận đơn không được để trống.")
      return
    }

    const unchanged =
      trackingNumber.trim() === String(order.trackingNumber ?? "").trim() &&
      trackingProvider === (order.trackingProvider ?? "ghn")

    if (unchanged) {
      toast.message("Không có thay đổi nào để lưu.")
      return
    }

    submitUpdate(buildTrackingPayload("shipping", trackingProvider, trackingNumber))
  }

  const handleCancelOrder = () => {
    submitUpdate({ status: "cancelled" }, () => setCancelOpen(false))
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Trạng thái hiện tại</p>
          <OrderStatusBadge status={order.status} />
        </div>

        {!terminal && stepIndex >= 0 && (
          <div className="flex items-center gap-1">
            {WORKFLOW_STEPS.map((step, index) => {
              const done = index < stepIndex
              const active = index === stepIndex
              return (
                <div key={step.status} className="flex flex-1 items-center gap-1">
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                        done && "border-primary bg-primary text-primary-foreground",
                        active && "border-primary bg-primary/10 text-primary",
                        !done && !active && "border-border text-muted-foreground"
                      )}
                    >
                      {done ? <CheckCircle2 className="size-3.5" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        "truncate text-center text-[10px] leading-tight",
                        active ? "font-medium text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mb-4 h-px flex-1",
                        index < stepIndex ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {terminal ? (
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            {order.status === "delivered" && "Đơn đã giao — không cần thao tác thêm."}
            {order.status === "cancelled" && "Đơn đã hủy."}
            {order.status === "returning" && "Đơn đang hoàn — liên hệ khách và đơn vị VC nếu cần."}
          </div>
        ) : (
          <>
            {actionHint && !showTrackingForm && (
              <p className="text-xs leading-relaxed text-muted-foreground">{actionHint}</p>
            )}

            {showTrackingForm && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-sm font-medium">
                  {mode === "handoff" ? "Nhập mã vận chuyển" : "Cập nhật mã vận chuyển"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Lấy mã từ web GHN/GHTK/Viettel Post sau khi tạo vận đơn. Link theo dõi sẽ được
                  tạo tự động.
                </p>
                <div className="space-y-2">
                  <Label>Đơn vị vận chuyển</Label>
                  <Select
                    value={trackingProvider}
                    onValueChange={(v) => setTrackingProvider(v as TrackingProvider)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRACKING_PROVIDERS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PROVIDER_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mã vận đơn</Label>
                  <Input
                    placeholder="vd: GHN123456789"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    disabled={updateStatus.isPending}
                    onClick={mode === "handoff" ? handleConfirmHandoff : handleSaveTracking}
                  >
                    {updateStatus.isPending && <Loader2 className="size-4 animate-spin" />}
                    {mode === "handoff" ? "Xác nhận giao VC" : "Lưu mã vận đơn"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode("default")}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}

            {!showTrackingForm && primaryLabel && (
              <Button
                className="w-full"
                disabled={updateStatus.isPending}
                onClick={handlePrimaryAction}
              >
                {updateStatus.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : order.status === "confirmed" ? (
                  <Package className="size-4" />
                ) : order.status === "packing" ? (
                  <Truck className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {primaryLabel}
              </Button>
            )}

            {!showTrackingForm && order.status === "shipping" && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setMode("edit-tracking")}
              >
                Cập nhật mã vận đơn
              </Button>
            )}
          </>
        )}

        {!terminal && !showTrackingForm && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => setCancelOpen(true)}
          >
            <XCircle className="size-4" />
            Hủy đơn
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Hủy đơn hàng?"
        description="Đơn sẽ chuyển sang trạng thái Đã hủy. Thao tác này không thể hoàn tác tự động."
        confirmLabel="Hủy đơn"
        destructive
        isLoading={updateStatus.isPending}
        onConfirm={handleCancelOrder}
      />
    </>
  )
}