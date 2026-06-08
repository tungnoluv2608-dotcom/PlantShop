import { useMemo, useState } from "react"
import { FileText, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { AdminOrderDetail } from "@/types"
import { getApiErrorMessage } from "@/lib/api-client"
import { fetchPrintSettings } from "@/features/print-settings/api"
import { fetchAdminOrderDetails } from "../api"
import { getFallbackPrintSettings } from "../shop-config"
import {
  countOrdersWithoutTracking,
  formatMissingTrackingMessage,
  printPackingSlips,
  printShippingLabels,
} from "../print-documents"

type PrintableOrderRef = Pick<AdminOrderDetail, "id" | "trackingNumber">

interface OrderPrintActionsProps {
  orderIds: string[]
  orders?: PrintableOrderRef[]
  size?: "default" | "sm"
  layout?: "row" | "column"
}

export function OrderPrintActions({
  orderIds,
  orders,
  size = "default",
  layout = "row",
}: OrderPrintActionsProps) {
  const [loading, setLoading] = useState<"label" | "slip" | null>(null)

  const labelBlockedReason = useMemo(() => {
    if (orderIds.length === 0) return null
    if (!orders || orders.length !== orderIds.length) return null
    const missing = countOrdersWithoutTracking(orders)
    return missing > 0 ? formatMissingTrackingMessage(orders) : null
  }, [orderIds.length, orders])

  const resolveOrders = async (): Promise<AdminOrderDetail[]> => {
    if (orders && orders.length === orderIds.length) {
      const hasFullDetails = orders.every(
        (order) => "items" in order && Array.isArray((order as AdminOrderDetail).items)
      )
      if (hasFullDetails) return orders as AdminOrderDetail[]
    }
    return fetchAdminOrderDetails(orderIds)
  }

  const resolvePrintSettings = async () => {
    try {
      return await fetchPrintSettings()
    } catch {
      return getFallbackPrintSettings()
    }
  }

  const runPrint = async (
    type: "label" | "slip",
    resolved: AdminOrderDetail[]
  ) => {
    const settings = await resolvePrintSettings()
    if (type === "label") printShippingLabels(resolved, settings)
    else printPackingSlips(resolved, settings)
  }

  const handlePrint = async (type: "label" | "slip") => {
    if (orderIds.length === 0) {
      toast.error("Chưa chọn đơn hàng nào.")
      return
    }

    if (type === "label" && labelBlockedReason) {
      toast.error(labelBlockedReason)
      return
    }

    setLoading(type)
    try {
      const resolved = await resolveOrders()

      if (type === "label") {
        const missingMessage = formatMissingTrackingMessage(resolved)
        if (missingMessage) {
          toast.error(missingMessage)
          return
        }
      }

      await runPrint(type, resolved)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(null)
    }
  }

  const className = layout === "column" ? "flex flex-col gap-2" : "flex flex-wrap gap-2"

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={loading !== null || orderIds.length === 0}
        onClick={() => handlePrint("slip")}
      >
        {loading === "slip" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        In phiếu soạn{orderIds.length > 1 ? ` (${orderIds.length})` : ""}
      </Button>
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled={loading !== null || orderIds.length === 0 || Boolean(labelBlockedReason)}
        title={labelBlockedReason ?? undefined}
        onClick={() => handlePrint("label")}
      >
        {loading === "label" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Tag className="size-4" />
        )}
        In nhãn giao{orderIds.length > 1 ? ` (${orderIds.length})` : ""}
      </Button>
    </div>
  )
}