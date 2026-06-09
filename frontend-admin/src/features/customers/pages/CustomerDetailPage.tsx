import { useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import {
  ArrowLeft,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
} from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { CopyButton } from "@/components/common/CopyButton"
import { DataTable } from "@/components/common/DataTable"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatVND, formatDate, formatDateTime } from "@/lib/format"
import type {
  CustomerAddress,
  CustomerOrderSummary,
  CustomerReviewSummary,
} from "@/types"
import { useCustomer } from "../api"
import { CustomerSegmentBadge } from "../components/CustomerSegmentBadge"
import { getCustomerSegment } from "../customer-segments"

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  )
}

function formatAddress(address: CustomerAddress): string {
  const parts = [
    address.addressLine,
    address.ward,
    address.district,
    address.province,
  ].filter(Boolean)
  return parts.join(", ")
}

const orderColumns: ColumnDef<CustomerOrderSummary>[] = [
  {
    accessorKey: "id",
    header: "Mã đơn",
    cell: ({ row }) => (
      <Link
        to={`/orders/${row.original.id}`}
        className="font-mono text-primary hover:underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "date",
    header: "Ngày",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "itemCount",
    header: "Sản phẩm",
    cell: ({ row }) => row.original.itemCount,
  },
  {
    accessorKey: "total",
    header: "Tổng",
    cell: ({ row }) => (
      <span className="font-semibold">{formatVND(row.original.total)}</span>
    ),
  },
]

const reviewColumns: ColumnDef<CustomerReviewSummary>[] = [
  {
    accessorKey: "productTitle",
    header: "Sản phẩm",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.productTitle}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.title}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Điểm",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 font-medium">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        {row.original.rating}
      </span>
    ),
  },
  {
    accessorKey: "verified",
    header: "Xác minh",
    cell: ({ row }) => (row.original.verified ? "Có" : "—"),
  },
  {
    accessorKey: "createdAt",
    header: "Ngày",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

export function CustomerDetailPage() {
  const { id = "" } = useParams()
  const customerQuery = useCustomer(id)
  const customer = customerQuery.data
  const [activeTab, setActiveTab] = useState("orders")

  const segment = useMemo(
    () => (customer ? getCustomerSegment(customer) : "regular"),
    [customer]
  )

  const ordersLink = `/orders?customerId=${id}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/customers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <PageHeader
            title={customer?.name ?? "Khách hàng"}
            description={customer?.email ?? "Đang tải thông tin khách hàng..."}
          />
        </div>
        {customer && (
          <Button variant="outline" asChild>
            <Link to={ordersLink}>
              <ShoppingBag className="size-4" />
              Xem tất cả đơn hàng
            </Link>
          </Button>
        )}
      </div>

      <QueryBoundary
        isLoading={customerQuery.isLoading}
        isError={customerQuery.isError}
        error={customerQuery.error}
        onRetry={() => customerQuery.refetch()}
        loadingFallback={
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
            <Skeleton className="h-72 w-full" />
          </div>
        }
        emptyFallback={
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Không tìm thấy khách hàng.
            </CardContent>
          </Card>
        }
        isEmpty={!customer}
      >
        {customer && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng chi tiêu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{formatVND(customer.totalSpent)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Không tính đơn đã hủy
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{customer.orderCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {customer.deliveredOrderCount ?? 0} đơn đã giao
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Đơn gần nhất
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tham gia {formatDate(customer.created_at)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Yêu thích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="inline-flex items-center gap-2 text-2xl font-semibold">
                    <Heart className="size-5 text-rose-500" />
                    {customer.wishlistCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sản phẩm trong wishlist
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="orders">
                    Đơn hàng ({customer.orders.length})
                  </TabsTrigger>
                  <TabsTrigger value="addresses">
                    Địa chỉ ({customer.addresses.length})
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    Đánh giá ({customer.reviews.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="mt-4">
                  <DataTable
                    columns={orderColumns}
                    data={customer.orders}
                    pageSize={8}
                  />
                </TabsContent>

                <TabsContent value="addresses" className="mt-4 space-y-3">
                  {customer.addresses.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Khách hàng chưa lưu địa chỉ nào.
                      </CardContent>
                    </Card>
                  ) : (
                    customer.addresses.map((address) => (
                      <Card key={address.id}>
                        <CardContent className="space-y-3 pt-6">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold">{address.label}</p>
                            {address.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Mặc định
                              </Badge>
                            )}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Người nhận" value={address.fullName} />
                            <Field label="Số điện thoại" value={address.phone} />
                          </div>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 size-4 shrink-0" />
                            <span>{formatAddress(address)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  <DataTable
                    columns={reviewColumns}
                    data={customer.reviews}
                    pageSize={8}
                  />
                </TabsContent>
              </Tabs>

              <Card className="h-fit">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CustomerSegmentBadge segment={segment} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="size-4" />
                        <span>{customer.email}</span>
                      </div>
                      <CopyButton value={customer.email} label="Đã sao chép email" />
                    </div>
                    {customer.phone && (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-4" />
                          <span>{customer.phone}</span>
                        </div>
                        <CopyButton value={customer.phone} label="Đã sao chép SĐT" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 border-t pt-4 text-sm">
                    <Field label="Mã khách" value={String(customer.id)} />
                    <Field
                      label="Ngày đăng ký"
                      value={formatDateTime(customer.created_at)}
                    />
                    <Field
                      label="Đơn đã giao"
                      value={String(customer.deliveredOrderCount ?? 0)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </QueryBoundary>
    </div>
  )
}