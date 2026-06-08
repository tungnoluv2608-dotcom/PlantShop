import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/lib/api-client"
import type { WholesaleInquiry } from "@/types"
import { useCreateWholesaleOrder } from "../api"

function parseQuantityNumber(rawValue: string) {
  const match = String(rawValue || "").match(/\d+/)
  if (!match) return 1
  const value = Number.parseInt(match[0], 10)
  return Number.isInteger(value) && value > 0 ? value : 1
}

interface CreateOrderDialogProps {
  inquiry: WholesaleInquiry
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (orderId: string) => void
}

export function CreateOrderDialog({
  inquiry,
  open,
  onOpenChange,
  onCreated,
}: CreateOrderDialogProps) {
  const createOrder = useCreateWholesaleOrder()
  const defaultQuantity = useMemo(() => parseQuantityNumber(inquiry.quantity), [inquiry.quantity])

  const [items, setItems] = useState<Array<{ productId: string; title: string; quantity: number }>>([])

  useEffect(() => {
    if (!open) return
    const products = inquiry.interestedProducts ?? []
    setItems(
      products.map((product) => ({
        productId: product.id,
        title: product.title || product.name || `Sản phẩm #${product.id}`,
        quantity: defaultQuantity,
      }))
    )
  }, [open, inquiry.interestedProducts, defaultQuantity])

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error("Cần ít nhất một sản phẩm để tạo đơn.")
      return
    }

    createOrder.mutate(
      {
        id: inquiry.id,
        payload: {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      {
        onSuccess: (data) => {
          toast.success(`${data.message} Mã đơn: ${data.orderId}`)
          onOpenChange(false)
          onCreated?.(data.orderId)
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo đơn từ yêu cầu B2B</DialogTitle>
          <DialogDescription>
            Xác nhận sản phẩm và số lượng trước khi tạo đơn hàng cho {inquiry.company}.
          </DialogDescription>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Yêu cầu chưa có sản phẩm quan tâm. Vui lòng cập nhật thông tin lead hoặc thêm sản phẩm thủ công sau.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.productId} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">Mã SP: {item.productId}</p>
                </div>
                <Input
                  type="number"
                  min={1}
                  className="w-24"
                  value={item.quantity}
                  onChange={(e) => {
                    const quantity = Math.max(1, Number.parseInt(e.target.value, 10) || 1)
                    setItems((prev) =>
                      prev.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, quantity } : entry
                      )
                    )
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createOrder.isPending || items.length === 0}>
            {createOrder.isPending && <Loader2 className="size-4 animate-spin" />}
            Tạo đơn hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}