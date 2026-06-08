import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ExternalLink, Loader2, Mail, Phone, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { WholesaleStatusBadge, WHOLESALE_STATUS } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { formatDateTime } from "@/lib/format"
import type { WholesaleInquiry } from "@/types"
import { WHOLESALE_STATUSES, wholesaleUpdateSchema, type WholesaleUpdateFormValues } from "../schema"
import {
  useWholesaleInquiry,
  useWholesaleActivities,
  useWholesaleAdmins,
  useUpdateWholesale,
} from "../api"
import { ActivityTimeline } from "../components/ActivityTimeline"
import { CreateOrderDialog } from "../components/CreateOrderDialog"

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  )
}

function InterestList({
  label,
  items,
}: {
  label: string
  items: Array<{ id: string; name?: string; title?: string }>
}) {
  if (!items.length) return null
  return (
    <div className="col-span-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="rounded-full border bg-muted/40 px-3 py-1 text-xs"
          >
            {item.title || item.name || `#${item.id}`}
          </span>
        ))}
      </div>
    </div>
  )
}

export function WholesaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [createOrderOpen, setCreateOrderOpen] = useState(false)

  const inquiryQuery = useWholesaleInquiry(id)
  const activitiesQuery = useWholesaleActivities(id)
  const adminsQuery = useWholesaleAdmins()
  const updateInquiry = useUpdateWholesale()
  const inquiry: WholesaleInquiry | undefined = inquiryQuery.data

  const form = useForm<WholesaleUpdateFormValues>({
    resolver: zodResolver(wholesaleUpdateSchema),
    defaultValues: { status: "new", assignedTo: "", assignedAdminId: "", adminNote: "" },
  })

  useEffect(() => {
    if (inquiry) {
      form.reset({
        status: inquiry.status,
        assignedTo: inquiry.assignedTo ?? "",
        assignedAdminId: inquiry.assignedAdminId ?? "",
        adminNote: inquiry.adminNote ?? "",
      })
    }
  }, [inquiry, form])

  const onSubmit = (values: WholesaleUpdateFormValues) => {
    if (!id) return
    const selectedAdmin = adminsQuery.data?.find((admin) => admin.id === values.assignedAdminId)
    updateInquiry.mutate(
      {
        id,
        payload: {
          status: values.status,
          assignedAdminId: values.assignedAdminId || undefined,
          assignedTo: selectedAdmin?.name || values.assignedTo,
          adminNote: values.adminNote,
        },
      },
      {
        onSuccess: () => toast.success("Đã cập nhật yêu cầu"),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  }

  const canCreateOrder =
    inquiry &&
    !inquiry.orderId &&
    ["qualified", "quoted", "won"].includes(inquiry.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link to="/wholesale">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <PageHeader
          title={inquiry?.company ?? "Yêu cầu báo giá"}
          description={inquiry ? `Tạo lúc ${formatDateTime(inquiry.createdAt)}` : undefined}
        />
      </div>

      <QueryBoundary
        isLoading={inquiryQuery.isLoading}
        isError={inquiryQuery.isError}
        error={inquiryQuery.error}
        onRetry={() => inquiryQuery.refetch()}
        loadingFallback={
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
        }
      >
        {inquiry && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle>Thông tin yêu cầu</CardTitle>
                  <div className="flex items-center gap-2">
                    <WholesaleStatusBadge status={inquiry.status} />
                    {canCreateOrder && (
                      <Button size="sm" onClick={() => setCreateOrderOpen(true)}>
                        <ShoppingCart className="size-4" />
                        Tạo đơn
                      </Button>
                    )}
                    {inquiry.orderId && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/orders/${inquiry.orderId}`}>
                          <ExternalLink className="size-4" />
                          Xem đơn {inquiry.orderId}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Field label="Người liên hệ" value={inquiry.contact} />
                  <Field label="Loại hình" value={inquiry.type} />
                  <Field label="Số lượng" value={inquiry.quantity} />
                  <Field label="Khu vực" value={inquiry.location} />
                  <Field label="Ngân sách" value={inquiry.budget} />
                  <Field label="Thời gian" value={inquiry.timeline} />
                  <Field label="Nguồn" value={inquiry.source} />
                  <Field label="Phụ trách" value={inquiry.assignedTo} />
                  <InterestList
                    label="Danh mục quan tâm"
                    items={inquiry.interestedCategories ?? []}
                  />
                  <InterestList
                    label="Sản phẩm quan tâm"
                    items={inquiry.interestedProducts ?? []}
                  />
                  <div className="col-span-2 flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${inquiry.email}`}>
                        <Mail className="size-4" /> {inquiry.email}
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${inquiry.phone}`}>
                        <Phone className="size-4" /> {inquiry.phone}
                      </a>
                    </Button>
                  </div>
                  {inquiry.note && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Ghi chú khách hàng</p>
                      <p className="mt-1 rounded-lg bg-muted/50 p-3 text-sm">{inquiry.note}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nhật ký hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline
                    activities={activitiesQuery.data}
                    isLoading={activitiesQuery.isLoading}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cập nhật CRM</CardTitle>
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
                              {WHOLESALE_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {WHOLESALE_STATUS[s].label}
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
                      name="assignedAdminId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Người phụ trách</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              const admin = adminsQuery.data?.find((item) => item.id === value)
                              if (admin) form.setValue("assignedTo", admin.name)
                            }}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn admin phụ trách" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {adminsQuery.data?.map((admin) => (
                                <SelectItem key={admin.id} value={admin.id}>
                                  {admin.name} ({admin.email})
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
                      name="adminNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú nội bộ</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="vd: Đã gọi điện..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={updateInquiry.isPending}>
                      {updateInquiry.isPending && <Loader2 className="size-4 animate-spin" />}
                      Lưu cập nhật
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>

      {inquiry && (
        <CreateOrderDialog
          inquiry={inquiry}
          open={createOrderOpen}
          onOpenChange={setCreateOrderOpen}
          onCreated={(orderId) => navigate(`/orders/${orderId}`)}
        />
      )}
    </div>
  )
}