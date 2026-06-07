import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatVND, formatDate } from "@/lib/format"
import type { AdminOrderRow, OrderStatus } from "@/types"
import { OrderPrintActions } from "../components/OrderPrintActions"
import { getRecipientPhone } from "../order-display"
import { PROVIDER_LABELS } from "../schema"
import { useAdminOrders } from "../api"

const PAYMENT_LABELS: Record<string, string> = {
  cod: "COD",
  payos: "PayOS",
  vnpay: "VNPay",
  momo: "MoMo",
  zalopay: "ZaloPay",
  bank: "Chuyển khoản",
}

type StatusFilter = "all" | OrderStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "packing", label: "Đóng gói" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
]

export function OrderListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminOrders()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredData = useMemo(() => {
    const rows = data ?? []
    if (statusFilter === "all") return rows
    return rows.filter((order) => order.status === statusFilter)
  }, [data, statusFilter])

  const allVisibleSelected =
    filteredData.length > 0 && filteredData.every((order) => selectedIds.has(order.id))

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        filteredData.forEach((order) => next.delete(order.id))
      } else {
        filteredData.forEach((order) => next.add(order.id))
      }
      return next
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedOrderIds = [...selectedIds]

  const columns: ColumnDef<AdminOrderRow>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allVisibleSelected}
          onCheckedChange={toggleSelectAll}
          aria-label="Chọn tất cả"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => toggleSelect(row.original.id)}
          aria-label={`Chọn đơn ${row.original.id}`}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
    },
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
          <p className="truncate font-medium">
            {row.original.recipientName || row.original.customerName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {getRecipientPhone(row.original)}
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
      accessorKey: "trackingNumber",
      header: "Vận đơn",
      cell: ({ row }) => {
        const provider = row.original.trackingProvider
        const tracking = row.original.trackingNumber
        if (!tracking) {
          return <span className="text-xs text-muted-foreground">Chưa có</span>
        }
        return (
          <div className="min-w-0">
            <p className="truncate font-mono text-xs">{tracking}</p>
            {provider && (
              <p className="truncate text-xs text-muted-foreground">
                {PROVIDER_LABELS[provider]}
              </p>
            )}
          </div>
        )
      },
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
      <PageHeader
        title="Đơn hàng"
        description="Theo dõi, lọc và in phiếu soạn / nhãn giao hàng."
      />

      <Tabs
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as StatusFilter)}
      >
        <TabsList className="h-auto flex-wrap justify-start">
          {STATUS_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchKey="id"
        searchPlaceholder="Tìm theo mã đơn..."
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            {selectedOrderIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Bỏ chọn ({selectedOrderIds.length})
              </Button>
            )}
            <OrderPrintActions orderIds={selectedOrderIds} size="sm" />
          </div>
        }
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
      />

      {selectedOrderIds.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Đã chọn {selectedOrderIds.length} đơn. Dùng nút in ở góc phải bảng để in hàng loạt.
        </p>
      )}
    </div>
  )
}