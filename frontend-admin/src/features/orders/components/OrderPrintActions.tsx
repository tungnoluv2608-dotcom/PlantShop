import { useState } from "react"
import { FileText, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { AdminOrderDetail } from "@/types"
import { getApiErrorMessage } from "@/lib/api-client"
import { fetchAdminOrderDetails } from "../api"
import { printPackingSlips, printShippingLabels } from "../print-documents"

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

  const resolveOrders = async (): Promise<AdminOrderDetail[]> => {
    if (orders && orders.length === orderIds.length) return orders
    return fetchAdminOrderDetails(orderIds)
  }

  const handlePrint = async (type: "label" | "slip") => {
    if (orderIds.length === 0) {
      toast.error("Chưa chọn đơn hàng nào.")
      return
    }

    setLoading(type)
    try {
      const resolved = await resolveOrders()
      if (type === "label") printShippingLabels(resolved)
      else printPackingSlips(resolved)
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
  )
}