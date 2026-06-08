import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { OrderStatusBadge } from "@/components/common/StatusBadge"
import {
  ListFilterToolbar,
  FilterSelect,
  FilterField,
  FilterSection,
  FilterDateRange,
  FilterNumberRange,
  StatusFilterTabs,
  buildFilterChips,
  countAdvancedFilters,
} from "@/components/common/FilterBar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { formatVND, formatDate } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api-client"
import { useListFilters } from "@/hooks/useListFilters"
import type { AdminOrderRow, OrderStatus } from "@/types"
import { OrderPrintActions } from "../components/OrderPrintActions"
import { getRecipientPhone } from "../order-display"
import { PROVIDER_LABELS } from "../schema"
import { useAdminOrders, useBulkConfirmOrders, useConfirmOrder } from "../api"
import {
  ORDER_FILTER_DEFAULTS,
  countOrdersByStatus,
  filterOrders,
  type OrderFilterState,
} from "../order-filters"

const PAYMENT_LABELS: Record<string, string> = {
  cod: "COD",
  payos: "PayOS",
  vnpay: "VNPay",
  momo: "MoMo",
  zalopay: "ZaloPay",
  bank: "Chuyển khoản",
}

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "packing", label: "Đóng gói" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
]

const PAYMENT_OPTIONS = [
  { value: "all", label: "Tất cả thanh toán" },
  ...Object.entries(PAYMENT_LABELS).map(([value, label]) => ({ value, label })),
]

const TRACKING_OPTIONS = [
  { value: "all", label: "Tất cả vận đơn" },
  { value: "yes", label: "Đã có vận đơn" },
  { value: "no", label: "Chưa có vận đơn" },
]

const PROVIDER_OPTIONS = [
  { value: "all", label: "Tất cả đơn vị" },
  ...Object.entries(PROVIDER_LABELS).map(([value, label]) => ({ value, label })),
]

export function OrderListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminOrders()
  const confirmOrder = useConfirmOrder()
  const bulkConfirm = useBulkConfirmOrders()

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(ORDER_FILTER_DEFAULTS)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const statusCounts = useMemo(
    () => countOrdersByStatus(data ?? []),
    [data]
  )

  const filteredData = useMemo(
    () => filterOrders(data ?? [], filters),
    [data, filters]
  )

  const selectedOrders = useMemo(
    () => (data ?? []).filter((order) => selectedIds.has(order.id)),
    [data, selectedIds]
  )
  const selectedPendingIds = selectedOrders
    .filter((order) => order.status === "pending")
    .map((order) => order.id)

  const allVisibleSelected =
    filteredData.length > 0 &&
    filteredData.every((order) => selectedIds.has(order.id))

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

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "payment",
          value: filters.payment,
          defaultValue: "all",
          label: "Thanh toán",
          formatValue: (v) => PAYMENT_LABELS[v] ?? v,
        },
        {
          key: "tracking",
          value: filters.tracking,
          defaultValue: "all",
          label: "Vận đơn",
          formatValue: (v) =>
            TRACKING_OPTIONS.find((o) => o.value === v)?.label ?? v,
        },
        {
          key: "provider",
          value: filters.provider,
          defaultValue: "all",
          label: "Đơn vị VC",
          formatValue: (v) => PROVIDER_LABELS[v as keyof typeof PROVIDER_LABELS] ?? v,
        },
        { key: "dateFrom", value: filters.dateFrom, defaultValue: "", label: "Từ" },
        { key: "dateTo", value: filters.dateTo, defaultValue: "", label: "Đến" },
        {
          key: "totalMin",
          value: filters.totalMin,
          defaultValue: "",
          label: "Tổng từ",
          formatValue: (v) => formatVND(Number(v)),
        },
        {
          key: "totalMax",
          value: filters.totalMax,
          defaultValue: "",
          label: "Tổng đến",
          formatValue: (v) => formatVND(Number(v)),
        },
      ]),
    [filters]
  )

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

      <StatusFilterTabs<OrderStatus | "all">
        value={filters.status as OrderStatus | "all"}
        onChange={(v) => setFilter("status", v)}
        options={STATUS_FILTERS}
        counts={statusCounts}
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm theo mã đơn, tên hoặc SĐT..."
        advancedFilterCount={countAdvancedFilters(filters, ORDER_FILTER_DEFAULTS, [
          "q",
          "status",
        ])}
        sheetTitle="Bộ lọc đơn hàng"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, ORDER_FILTER_DEFAULTS[key as keyof OrderFilterState] ?? "")
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        quickFilters={
          <FilterSelect
            variant="toolbar"
            value={filters.payment}
            onChange={(v) => setFilter("payment", v)}
            placeholder="Thanh toán"
            options={PAYMENT_OPTIONS}
          />
        }
        sheetContent={
          <>
            <FilterSection title="Vận chuyển">
              <FilterField label="Vận đơn">
                <FilterSelect
                  value={filters.tracking}
                  onChange={(v) => setFilter("tracking", v)}
                  placeholder="Vận đơn"
                  options={TRACKING_OPTIONS}
                />
              </FilterField>
              <FilterField label="Đơn vị vận chuyển">
                <FilterSelect
                  value={filters.provider}
                  onChange={(v) => setFilter("provider", v)}
                  placeholder="Đơn vị VC"
                  options={PROVIDER_OPTIONS}
                />
              </FilterField>
            </FilterSection>
            <FilterSection title="Thời gian">
              <FilterDateRange
                stacked
                from={filters.dateFrom}
                to={filters.dateTo}
                onFromChange={(v) => setFilter("dateFrom", v)}
                onToChange={(v) => setFilter("dateTo", v)}
              />
            </FilterSection>
            <FilterSection title="Giá trị đơn">
              <FilterNumberRange
                stacked
                min={filters.totalMin}
                max={filters.totalMax}
                onMinChange={(v) => setFilter("totalMin", v)}
                onMaxChange={(v) => setFilter("totalMax", v)}
                minLabel="Tổng từ (₫)"
                maxLabel="Tổng đến (₫)"
              />
            </FilterSection>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        totalCount={data?.length}
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
            : filters.status === "packing"
              ? " Nhập mã vận đơn trong chi tiết đơn trước khi in nhãn giao."
              : " Dùng nút in ở góc phải bảng để in hàng loạt."}
        </p>
      )}
    </div>
  )
}