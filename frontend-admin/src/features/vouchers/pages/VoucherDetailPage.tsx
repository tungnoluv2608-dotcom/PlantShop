import { useParams, Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND, formatDateTime } from "@/lib/format"
import type { VoucherRedemption } from "@/types"
import { useVoucher, useVoucherRedemptions } from "../api"
import { formatDiscountLabel } from "../voucher-filters"

const columns: ColumnDef<VoucherRedemption>[] = [
  {
    accessorKey: "orderId",
    header: "Đơn hàng",
    cell: ({ row }) =>
      row.original.orderId ? (
        <Link to={`/orders/${row.original.orderId}`} className="font-mono text-primary hover:underline">
          {row.original.orderId}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "customerName",
    header: "Khách hàng",
    cell: ({ row }) => (
      <div>
        <p>{row.original.customerName}</p>
        <p className="text-xs text-muted-foreground">{row.original.customerEmail}</p>
      </div>
    ),
  },
  {
    accessorKey: "discountAmount",
    header: "Giảm",
    cell: ({ row }) => formatVND(row.original.discountAmount),
  },
  {
    accessorKey: "orderTotal",
    header: "Tổng đơn",
    cell: ({ row }) => (row.original.orderTotal != null ? formatVND(row.original.orderTotal) : "—"),
  },
  {
    accessorKey: "orderStatus",
    header: "Trạng thái",
    cell: ({ row }) => row.original.orderStatus ?? "—",
  },
  {
    accessorKey: "redeemedAt",
    header: "Thời điểm",
    cell: ({ row }) => formatDateTime(row.original.redeemedAt),
  },
]

export function VoucherDetailPage() {
  const { id = "" } = useParams()
  const { data: voucher, isLoading: voucherLoading } = useVoucher(id)
  const { data: report, isLoading: reportLoading } = useVoucherRedemptions(id)

  if (voucherLoading || reportLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!voucher || !report) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Không tìm thấy voucher.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link to="/vouchers">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <PageHeader title={voucher.code} description={voucher.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ưu đãi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatDiscountLabel(voucher)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Đơn tối thiểu {formatVND(voucher.minOrderValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lượt sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {report.summary.totalUsed}
              {voucher.usageLimit ? ` / ${voucher.usageLimit}` : ""}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tối đa {voucher.usagePerUser} lần / khách
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng giảm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatVND(report.summary.totalDiscount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Trên các đơn chưa hủy</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin cấu hình</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Phạm vi: </span>
            <Badge variant="outline">{voucher.appliesTo}</Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Trạng thái: </span>
            {voucher.isActive ? "Kích hoạt" : "Đã tắt"}
          </div>
          <div>
            <span className="text-muted-foreground">Bắt đầu: </span>
            {formatDateTime(voucher.startsAt)}
          </div>
          <div>
            <span className="text-muted-foreground">Kết thúc: </span>
            {formatDateTime(voucher.expiresAt)}
          </div>
          {voucher.description && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Mô tả: </span>
              {voucher.description}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Lịch sử sử dụng</h2>
        <DataTable columns={columns} data={report.redemptions} />
      </div>
    </div>
  )
}