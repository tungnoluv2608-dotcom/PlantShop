import { useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { formatVND, formatDate } from "@/lib/format"
import type { AdminOrderRow } from "@/types"
import { useAdminOrders } from "../api"

const PAYMENT_LABELS: Record<string, string> = {
  cod: "COD",
  payos: "PayOS",
  vnpay: "VNPay",
  momo: "MoMo",
  zalopay: "ZaloPay",
  bank: "Chuyển khoản",
}

export function OrderListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminOrders()

  const columns: ColumnDef<AdminOrderRow>[] = [
    {
      accessorKey: "id",
      header: "Mã đơn",
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.id}</span>,
    },
    {
      accessorKey: "customerName",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.customerEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Ngày",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "itemCount",
      header: "SL",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.itemCount}</span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Thanh toán",
      cell: ({ row }) => (
        <span className="text-sm">
          {PAYMENT_LABELS[row.original.paymentMethod] ?? row.original.paymentMethod}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Tổng",
      cell: ({ row }) => (
        <span className="font-semibold">{formatVND(row.original.total)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Đơn hàng" description="Theo dõi và cập nhật đơn hàng." />

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchKey="id"
        searchPlaceholder="Tìm theo mã đơn..."
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
      />
    </div>
  )
}
