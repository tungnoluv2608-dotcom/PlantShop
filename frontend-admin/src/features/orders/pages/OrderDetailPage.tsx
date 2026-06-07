import { useEffect } from "react"
import { useParams, Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ExternalLink, Loader2, CheckCircle2, Circle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatVND, formatDateTime } from "@/lib/format"
import { ORDER_STATUS } from "@/components/common/StatusBadge"
import type { OrderStatusPayload } from "@/types"
import { OrderPrintActions } from "../components/OrderPrintActions"
import { getShippingMethodLabel, resolveRecipient } from "../order-display"
import {
  orderStatusSchema,
  ORDER_STATUSES,
  TRACKING_PROVIDERS,
  PROVIDER_LABELS,
  type OrderStatusFormValues,
} from "../schema"
import { useAdminOrder, useUpdateOrderStatus, useUpdateOrderNote } from "../api"

function getWorkflowHint(status: string, hasTracking: boolean): string | null {
  switch (status) {
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
  const updateStatus = useUpdateOrderStatus()
  const updateNote = useUpdateOrderNote()
  const order = orderQuery.data

  const form = useForm<OrderStatusFormValues>({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: "confirmed",
      timelineEntry: "",
      trackingNumber: "",
      trackingProvider: "ghn",
      trackingUrl: "",
    },
  })

  const noteForm = useForm<{ internalNote: string }>({
    defaultValues: { internalNote: "" },
  })

  useEffect(() => {
    if (order) {
      form.reset({
        status: order.status,
        timelineEntry: "",
        trackingNumber: order.trackingNumber ?? "",
        trackingProvider: order.trackingProvider ?? "ghn",
        trackingUrl: order.trackingUrl ?? "",
      })
      noteForm.reset({ internalNote: order.internalNote ?? "" })
    }
  }, [order, form, noteForm])

  const onSubmit = (values: OrderStatusFormValues) => {
    if (!id) return

    if (values.status === "shipping" && !values.trackingNumber.trim()) {
      toast.error("Vui lòng nhập mã vận đơn trước khi chuyển sang Đang giao.")
      return
    }

    const payload: OrderStatusPayload = { status: values.status }
    if (values.timelineEntry.trim()) payload.timelineEntry = values.timelineEntry.trim()
    if (values.trackingNumber.trim()) payload.trackingNumber = values.trackingNumber.trim()
    if (values.trackingNumber.trim()) payload.trackingProvider = values.trackingProvider
    if (values.trackingUrl.trim()) payload.trackingUrl = values.trackingUrl.trim()

    updateStatus.mutate(
      { id, payload },
      {
        onSuccess: (res) => toast.success(res.message),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
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
                <Alert>
                  <AlertTriangle className="size-4" />
                  <AlertDescription>{workflowHint}</AlertDescription>
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
                  <CardTitle>Giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Người nhận</p>
                    <p className="font-medium">
                      {recipient?.name} · {recipient?.phone}
                    </p>
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
                      <p className="font-mono font-medium">{order.trackingNumber}</p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Cập nhật trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trạng thái</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ORDER_STATUSES.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {ORDER_STATUS[status]?.label ?? status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="timelineEntry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ghi chú dòng thời gian</FormLabel>
                            <FormControl>
                              <Input placeholder="Để trống = tự tạo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trackingProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Đơn vị vận chuyển</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRACKING_PROVIDERS.map((p) => (
                                  <SelectItem key={p} value={p}>
                                    {PROVIDER_LABELS[p]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trackingNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã vận đơn</FormLabel>
                            <FormControl>
                              <Input placeholder="vd: GHN123456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trackingUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link theo dõi</FormLabel>
                            <FormControl>
                              <Input placeholder="Để trống = tự tạo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={updateStatus.isPending}>
                        {updateStatus.isPending && <Loader2 className="size-4 animate-spin" />}
                        Cập nhật
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  )
}