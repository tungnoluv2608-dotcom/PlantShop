import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import {
  ListFilterToolbar,
  FilterSelect,
  FilterSection,
  FilterDateRange,
  FilterNumberRange,
  StatusFilterTabs,
  buildFilterChips,
  countAdvancedFilters,
} from "@/components/common/FilterBar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useListFilters } from "@/hooks/useListFilters"
import { formatVND, formatDate } from "@/lib/format"
import { uniqueSorted } from "@/lib/filters"
import type { Customer } from "@/types"
import { useCustomers } from "../api"
import {
  CUSTOMER_FILTER_DEFAULTS,
  filterCustomers,
  type CustomerFilterState,
  type CustomerSegment,
} from "../customer-filters"

const SEGMENT_TABS: Array<{ value: CustomerSegment; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "vip", label: "VIP" },
  { value: "new", label: "Mới (7 ngày)" },
  { value: "no_orders", label: "Chưa mua" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "spent_desc", label: "Chi tiêu cao" },
  { value: "orders_desc", label: "Nhiều đơn" },
  { value: "name_asc", label: "Tên A → Z" },
]

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function CustomerListPage() {
  const { data, isLoading } = useCustomers()

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(CUSTOMER_FILTER_DEFAULTS)

  const filteredData = useMemo(
    () => filterCustomers(data ?? [], filters),
    [data, filters]
  )

  const roleOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả vai trò" },
      ...uniqueSorted((data ?? []).map((c) => c.role)).map((role) => ({
        value: role,
        label: role,
      })),
    ],
    [data]
  )

  const segmentCounts = useMemo(() => {
    const all = data ?? []
    return {
      all: all.length,
      vip: all.filter((c) => c.totalSpent >= 5_000_000).length,
      new: all.filter((c) => {
        const d = new Date(c.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return d >= weekAgo
      }).length,
      no_orders: all.filter((c) => c.orderCount === 0).length,
    }
  }, [data])

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "role",
          value: filters.role,
          defaultValue: "all",
          label: "Vai trò",
        },
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
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.role}
        </Badge>
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
      <PageHeader title="Khách hàng" description="Danh sách khách hàng và chi tiêu." />

      <StatusFilterTabs<CustomerSegment>
        value={filters.segment as CustomerSegment}
        onChange={(v) => setFilter("segment", v)}
        options={SEGMENT_TABS}
        counts={segmentCounts}
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm theo tên, email, mã..."
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => setFilter("sort", v)}
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
        quickFilters={
          <FilterSelect
            variant="toolbar"
            value={filters.role}
            onChange={(v) => setFilter("role", v)}
            placeholder="Vai trò"
            options={roleOptions}
          />
        }
        sheetContent={
          <>
            <FilterSection title="Thời gian">
              <FilterDateRange
                stacked
                from={filters.dateFrom}
                to={filters.dateTo}
                onFromChange={(v) => setFilter("dateFrom", v)}
                onToChange={(v) => setFilter("dateTo", v)}
              />
            </FilterSection>
            <FilterSection title="Hoạt động mua hàng">
              <FilterNumberRange
                stacked
                min={filters.ordersMin}
                max={filters.ordersMax}
                onMinChange={(v) => setFilter("ordersMin", v)}
                onMaxChange={(v) => setFilter("ordersMax", v)}
                minLabel="Số đơn từ"
                maxLabel="Số đơn đến"
              />
              <FilterNumberRange
                stacked
                min={filters.spentMin}
                max={filters.spentMax}
                onMinChange={(v) => setFilter("spentMin", v)}
                onMaxChange={(v) => setFilter("spentMax", v)}
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
      />
    </div>
  )
}