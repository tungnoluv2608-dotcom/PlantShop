import { useMemo } from "react"
import { useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import {
  ListFilterToolbar,
  FilterSection,
  FilterDateRange,
  FilterNumberRange,
  StatusFilterTabs,
  buildFilterChips,
  countAdvancedFilters,
} from "@/components/common/FilterBar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatVND, formatDate } from "@/lib/format"
import { useListFilters } from "@/hooks/useListFilters"
import type { Customer } from "@/types"
import { useCustomers } from "../api"
import { CustomerSegmentBadge } from "../components/CustomerSegmentBadge"
import {
  CUSTOMER_FILTER_DEFAULTS,
  filterCustomers,
  type CustomerFilterState,
  type CustomerListSegment,
} from "../customer-filters"
import {
  VIP_SPENT_THRESHOLD,
  VIP_DELIVERED_ORDER_THRESHOLD,
  getCustomerSegment,
} from "../customer-segments"

const SEGMENT_TABS: Array<{ value: CustomerListSegment; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "vip", label: "VIP" },
  { value: "loyal", label: "Thân thiết" },
  { value: "new", label: "Mới (7 ngày)" },
  { value: "no_orders", label: "Chưa mua" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "spent_desc", label: "Chi tiêu cao" },
  { value: "orders_desc", label: "Nhiều đơn" },
  { value: "last_order_desc", label: "Mua gần đây" },
  { value: "name_asc", label: "Tên A → Z" },
]

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function CustomerListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useCustomers()

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(CUSTOMER_FILTER_DEFAULTS)

  const filteredData = useMemo(
    () => filterCustomers(data ?? [], filters),
    [data, filters]
  )

  const segmentCounts = useMemo(() => {
    const all = data ?? []
    return {
      all: all.length,
      vip: all.filter(
        (customer) =>
          customer.totalSpent >= VIP_SPENT_THRESHOLD ||
          (customer.deliveredOrderCount ?? 0) >= VIP_DELIVERED_ORDER_THRESHOLD
      ).length,
      loyal: all.filter(
        (customer) => getCustomerSegment(customer) === "loyal"
      ).length,
      new: all.filter((customer) => getCustomerSegment(customer) === "new").length,
      no_orders: all.filter((customer) => customer.orderCount === 0).length,
    }
  }, [data])

  const chips = useMemo(
    () =>
      buildFilterChips([
        { key: "dateFrom", value: filters.dateFrom, defaultValue: "", label: "Từ" },
        { key: "dateTo", value: filters.dateTo, defaultValue: "", label: "Đến" },
      ]),
    [filters]
  )

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "SĐT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      id: "segment",
      header: "Phân loại",
      cell: ({ row }) => (
        <CustomerSegmentBadge segment={getCustomerSegment(row.original)} />
      ),
    },
    {
      accessorKey: "orderCount",
      header: "Số đơn",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.orderCount}</span>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "Tổng chi tiêu",
      cell: ({ row }) => (
        <span className="font-semibold">{formatVND(row.original.totalSpent)}</span>
      ),
    },
    {
      accessorKey: "lastOrderDate",
      header: "Đơn gần nhất",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastOrderDate
            ? formatDate(row.original.lastOrderDate)
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Ngày tham gia",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách hàng"
        description="Danh sách khách hàng, chi tiêu và lịch sử mua hàng."
      />

      <StatusFilterTabs<CustomerListSegment>
        value={filters.segment}
        onChange={(value) => setFilter("segment", value)}
        options={SEGMENT_TABS}
        counts={segmentCounts}
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(value) => setFilter("q", value)}
        searchPlaceholder="Tìm theo tên, email, SĐT, mã..."
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(value) => setFilter("sort", value)}
        advancedFilterCount={countAdvancedFilters(filters, CUSTOMER_FILTER_DEFAULTS, [
          "q",
          "sort",
          "segment",
        ])}
        sheetTitle="Bộ lọc khách hàng"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, CUSTOMER_FILTER_DEFAULTS[key as keyof CustomerFilterState] ?? "")
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        sheetContent={
          <>
            <FilterSection title="Thời gian đăng ký">
              <FilterDateRange
                stacked
                from={filters.dateFrom}
                to={filters.dateTo}
                onFromChange={(value) => setFilter("dateFrom", value)}
                onToChange={(value) => setFilter("dateTo", value)}
              />
            </FilterSection>
            <FilterSection title="Hoạt động mua hàng">
              <FilterNumberRange
                stacked
                min={filters.ordersMin}
                max={filters.ordersMax}
                onMinChange={(value) => setFilter("ordersMin", value)}
                onMaxChange={(value) => setFilter("ordersMax", value)}
                minLabel="Số đơn từ"
                maxLabel="Số đơn đến"
              />
              <FilterNumberRange
                stacked
                min={filters.spentMin}
                max={filters.spentMax}
                onMinChange={(value) => setFilter("spentMin", value)}
                onMaxChange={(value) => setFilter("spentMax", value)}
                minLabel="Chi tiêu từ (₫)"
                maxLabel="Chi tiêu đến (₫)"
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
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
      />
    </div>
  )
}