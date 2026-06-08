import { useEffect } from "react"
import { useParams, Link } from "react-router"
import { useForm } from "react-hook-form"
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Check,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { CopyButton } from "@/components/common/CopyButton"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatVND, formatDateTime } from "@/lib/format"
import { OrderPrintActions } from "../components/OrderPrintActions"
import { OrderStatusActions } from "../components/OrderStatusActions"
import { getShippingMethodLabel, resolveRecipient } from "../order-display"
import { PROVIDER_LABELS } from "../schema"
import { useAdminOrder, useConfirmOrder, useUpdateOrderNote } from "../api"

function getWorkflowHint(status: string, hasTracking: boolean): string | null {
  switch (status) {
    case "pending":
      return "Đơn mới — xác nhận để bắt đầu soạn hàng và in phiếu."
    case "confirmed":
      return "Bước tiếp theo: in phiếu soạn hàng, đóng gói và chuyển sang Đang đóng gói."
    case "packing":
      return "Bước tiếp theo: tạo vận đơn với đơn vị VC, in nhãn giao hàng và nhập mã vận đơn."
    case "shipping":
      return hasTracking
        ? "Đơn đang được vận chuyển. Theo dõi qua link vận đơn."
        : "Nên bổ sung mã vận đơn để khách theo dõi được lộ trình."
    default:
      return null
  }
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const orderQuery = useAdminOrder(id)
  const updateNote = useUpdateOrderNote()
  const confirmOrder = useConfirmOrder()
  const order = orderQuery.data
  const isPending = order?.status === "pending"

  const noteForm = useForm<{ internalNote: string }>({
    defaultValues: { internalNote: "" },
  })

  useEffect(() => {
    if (order) {
      noteForm.reset({ internalNote: order.internalNote ?? "" })
    }
  }, [order, noteForm])

  const handleConfirmOrder = () => {
    if (!id) return
    confirmOrder.mutate(id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const onSaveNote = noteForm.handleSubmit((values) => {
    if (!id) return
    updateNote.mutate(
      { id, payload: { internalNote: values.internalNote } },
      {
        onSuccess: (res) => toast.success(res.message),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  })

  const recipient = order ? resolveRecipient(order) : null
  const workflowHint = order
    ? getWorkflowHint(order.status, Boolean(order.trackingNumber?.trim()))
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <PageHeader
            title={`Đơn hàng ${id}`}
            description={order ? formatDateTime(order.date) : undefined}
          />
        </div>
        {order && <OrderPrintActions orderIds={[order.id]} orders={[order]} />}
      </div>

      <QueryBoundary
        isLoading={orderQuery.isLoading}
        isError={orderQuery.isError}
        error={orderQuery.error}
        onRetry={() => orderQuery.refetch()}
        loadingFallback={
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        }
      >
        {order && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {workflowHint && (
                <Alert variant={isPending ? "destructive" : "default"}>
                  <AlertTriangle className="size-4" />
                  <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>{workflowHint}</span>
                    {isPending && (
                      <Button
                        size="sm"
                        disabled={confirmOrder.isPending}
                        onClick={handleConfirmOrder}
                      >
                        {confirmOrder.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        Xác nhận đơn
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Sản phẩm</CardTitle>
                  <OrderStatusBadge status={order.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        width={56}
                        height={56}
                        className="size-14 rounded-lg border border-border object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        {item.planter && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.planter}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatVND(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tạm tính</span>
                      <span>{formatVND(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Phí vận chuyển</span>
                      <span>{formatVND(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold">
                      <span>Tổng cộng</span>
                      <span>{formatVND(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {order.timeline.map((entry, index) => (
                      <li key={index} className="flex gap-3">
                        {entry.done ? (
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                        ) : (
                          <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{entry.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(entry.date)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Khách hàng & giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Mã đơn</p>
                    <div className="flex items-center gap-1">
                      <p className="font-mono font-medium">{order.id}</p>
                      <CopyButton value={order.id} label="Đã sao chép mã đơn" />
                    </div>
                  </div>
                  {order.customerEmail && (
                    <div>
                      <p className="text-muted-foreground">Email khách</p>
                      <div className="flex items-center gap-1">
                        <p className="font-medium">{order.customerEmail}</p>
                        <CopyButton value={order.customerEmail} label="Đã sao chép email" />
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Người nhận</p>
                    <div className="flex items-start gap-1">
                      <p className="font-medium">
                        {recipient?.name} · {recipient?.phone}
                      </p>
                      {recipient?.phone && recipient.phone !== "—" && (
                        <CopyButton value={recipient.phone} label="Đã sao chép SĐT" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Địa chỉ nhận</p>
                    <p className="font-medium">{recipient?.address}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hình thức giao</span>
                    <span className="font-medium">
                      {getShippingMethodLabel(order.shippingMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thanh toán</span>
                    <span className="font-medium uppercase">{order.paymentMethod}</span>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-muted-foreground">Mã vận đơn</p>
                      <div className="flex items-center gap-1">
                        <p className="font-mono font-medium">{order.trackingNumber}</p>
                        <CopyButton
                          value={order.trackingNumber}
                          label="Đã sao chép mã vận đơn"
                        />
                      </div>
                      {order.trackingProvider && (
                        <p className="text-xs text-muted-foreground">
                          {PROVIDER_LABELS[order.trackingProvider]}
                        </p>
                      )}
                    </div>
                  )}
                  {order.trackingUrl && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={order.trackingUrl} target="_blank" rel="noreferrer">
                        Theo dõi vận đơn <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú nội bộ</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSaveNote} className="space-y-3">
                    <Textarea
                      placeholder="vd: Cây dễ vỡ, giao giờ hành chính..."
                      rows={4}
                      {...noteForm.register("internalNote")}
                    />
                    <Button type="submit" variant="outline" className="w-full" disabled={updateNote.isPending}>
                      {updateNote.isPending && <Loader2 className="size-4 animate-spin" />}
                      Lưu ghi chú
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {!isPending && (
                <Card>
                  <CardHeader>
                    <CardTitle>Xử lý đơn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderStatusActions order={order} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}