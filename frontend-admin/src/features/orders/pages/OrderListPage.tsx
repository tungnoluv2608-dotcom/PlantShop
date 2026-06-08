import { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { Check, Loader2, Search } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatVND, formatDate } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import type { AdminOrderRow, OrderStatus } from "@/types"
import { OrderPrintActions } from "../components/OrderPrintActions"
import { getRecipientPhone } from "../order-display"
import { matchesOrderSearch } from "../order-search"
import { PROVIDER_LABELS } from "../schema"
import { useAdminOrders, useBulkConfirmOrders, useConfirmOrder } from "../api"

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
  { value: "cancelled", label: "Đã hủy" },
]

function isStatusFilter(value: string | null): value is StatusFilter {
  return STATUS_FILTERS.some((filter) => filter.value === value)
}

export function OrderListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get("status")
  const { data, isLoading } = useAdminOrders()
  const confirmOrder = useConfirmOrder()
  const bulkConfirm = useBulkConfirmOrders()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    isStatusFilter(initialStatus) ? initialStatus : "all"
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<StatusFilter, number>> = { all: data?.length ?? 0 }
    for (const order of data ?? []) {
      const key = order.status as StatusFilter
      counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  }, [data])

  const filteredData = useMemo(() => {
    let rows = data ?? []
    if (statusFilter !== "all") {
      rows = rows.filter((order) => order.status === statusFilter)
    }
    if (searchQuery.trim()) {
      rows = rows.filter((order) => matchesOrderSearch(order, searchQuery))
    }
    return rows
  }, [data, statusFilter, searchQuery])

  const selectedOrders = useMemo(
    () => (data ?? []).filter((order) => selectedIds.has(order.id)),
    [data, selectedIds]
  )
  const selectedPendingIds = selectedOrders
    .filter((order) => order.status === "pending")
    .map((order) => order.id)

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

  const handleConfirmOne = (orderId: string) => {
    confirmOrder.mutate(orderId, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const handleBulkConfirm = () => {
    if (selectedPendingIds.length === 0) {
      toast.error("Không có đơn chờ xử lý nào trong danh sách đã chọn.")
      return
    }

    bulkConfirm.mutate(selectedPendingIds, {
      onSuccess: ({ confirmed, failed }) => {
        if (confirmed > 0) {
          toast.success(`Đã xác nhận ${confirmed} đơn.`)
        }
        if (failed > 0) {
          toast.error(`${failed} đơn xác nhận thất bại.`)
        }
        setSelectedIds(new Set())
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "pending" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={confirmOrder.isPending}
            onClick={(e) => {
              e.stopPropagation()
              handleConfirmOne(row.original.id)
            }}
          >
            {confirmOrder.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Xác nhận
          </Button>
        ) : null,
      enableSorting: false,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đơn hàng"
        description="Theo dõi, lọc và in phiếu soạn / nhãn giao hàng."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/print-settings">Cài đặt in ấn</Link>
          </Button>
        }
      />

      <Tabs
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as StatusFilter)}
      >
        <TabsList className="h-auto flex-wrap justify-start">
          {STATUS_FILTERS.map((filter) => {
            const count = statusCounts[filter.value]
            return (
              <TabsTrigger key={filter.value} value={filter.value} className="gap-2">
                {filter.label}
                {typeof count === "number" && count > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã đơn, tên hoặc SĐT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            {selectedPendingIds.length > 0 && (
              <Button
                size="sm"
                disabled={bulkConfirm.isPending}
                onClick={handleBulkConfirm}
              >
                {bulkConfirm.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Xác nhận ({selectedPendingIds.length})
              </Button>
            )}
            {selectedOrderIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Bỏ chọn ({selectedOrderIds.length})
              </Button>
            )}
            <OrderPrintActions
              orderIds={selectedOrderIds}
              orders={selectedOrders}
              size="sm"
            />
          </div>
        }
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
      />

      {selectedOrderIds.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Đã chọn {selectedOrderIds.length} đơn.
          {selectedPendingIds.length > 0
            ? ` Có ${selectedPendingIds.length} đơn chờ xử lý có thể xác nhận hàng loạt.`
            : statusFilter === "packing"
              ? " Nhập mã vận đơn trong chi tiết đơn trước khi in nhãn giao."
              : " Dùng nút in ở góc phải bảng để in hàng loạt."}
        </p>
      )}
    </div>
  )
}