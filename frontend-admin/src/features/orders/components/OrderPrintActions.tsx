import { useState } from "react"
import { FileText, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import type { AdminOrderDetail } from "@/types"
import { getApiErrorMessage } from "@/lib/api-client"
import { fetchPrintSettings } from "@/features/print-settings/api"
import { fetchAdminOrderDetails } from "../api"
import { getFallbackPrintSettings } from "../shop-config"
import {
  countOrdersWithoutTracking,
  printPackingSlips,
  printShippingLabels,
} from "../print-documents"

interface OrderPrintActionsProps {
  orderIds: string[]
  orders?: AdminOrderDetail[]
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
  const [labelConfirmOpen, setLabelConfirmOpen] = useState(false)
  const [pendingLabelOrders, setPendingLabelOrders] = useState<AdminOrderDetail[]>([])

  const resolveOrders = async (): Promise<AdminOrderDetail[]> => {
    if (orders && orders.length === orderIds.length) return orders
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

    setLoading(type)
    try {
      const resolved = await resolveOrders()

      if (type === "label") {
        const missingTracking = countOrdersWithoutTracking(resolved)
        if (missingTracking > 0) {
          setPendingLabelOrders(resolved)
          setLabelConfirmOpen(true)
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

  const handleConfirmLabelPrint = async () => {
    try {
      await runPrint("label", pendingLabelOrders)
      setLabelConfirmOpen(false)
      setPendingLabelOrders([])
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(null)
    }
  }

  const className = layout === "column" ? "flex flex-col gap-2" : "flex flex-wrap gap-2"
  const missingCount = countOrdersWithoutTracking(pendingLabelOrders)

  return (
    <>
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
          disabled={loading !== null || orderIds.length === 0}
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

      <ConfirmDialog
        open={labelConfirmOpen}
        onOpenChange={(open) => {
          setLabelConfirmOpen(open)
          if (!open) {
            setPendingLabelOrders([])
            setLoading(null)
          }
        }}
        title="In nhãn chưa có mã vận đơn?"
        description={
          missingCount === pendingLabelOrders.length
            ? `${missingCount} đơn chưa có mã vận đơn. Bạn có thể in để điền tay sau khi tạo trên GHN/GHTK, hoặc hủy để nhập mã trước.`
            : `${missingCount}/${pendingLabelOrders.length} đơn chưa có mã vận đơn. Tiếp tục in?`
        }
        confirmLabel="Vẫn in"
        onConfirm={handleConfirmLabelPrint}
      />
    </>
  )
}