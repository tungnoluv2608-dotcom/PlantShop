import { useMemo } from "react"
import { useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { WholesaleStatusBadge, WHOLESALE_STATUS } from "@/components/common/StatusBadge"
import {
  ListFilterToolbar,
  FilterSelect,
  FilterField,
  FilterSection,
  FilterDateRange,
  StatusFilterTabs,
  buildFilterChips,
  countAdvancedFilters,
} from "@/components/common/FilterBar"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useListFilters } from "@/hooks/useListFilters"
import { uniqueSorted } from "@/lib/filters"
import type { WholesaleInquiry, WholesaleStatus } from "@/types"
import { WHOLESALE_STATUSES } from "../schema"
import { useWholesaleInquiries } from "../api"
import {
  WHOLESALE_FILTER_DEFAULTS,
  WHOLESALE_LIST_FILTER_DEFAULTS,
  type WholesaleFilterState,
} from "../wholesale-filters"

const STATUS_TABS: Array<{
  value: WholesaleStatus | "all"
  label: string
}> = [
  { value: "all", label: "Tất cả" },
  ...WHOLESALE_STATUSES.map((s) => ({
    value: s,
    label: WHOLESALE_STATUS[s].label,
  })),
]

export function WholesaleListPage() {
  const navigate = useNavigate()
  const { values: filters, setFilter, setFilters, clearFilters, hasActiveFilters } =
    useListFilters(WHOLESALE_LIST_FILTER_DEFAULTS)

  const resetPage = (updates: Partial<Record<keyof WholesaleFilterState, string>>) => {
    setFilters({ ...updates, page: "1" })
  }

  const debouncedQ = useDebouncedValue(filters.q, 350)
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1)

  const { data, isLoading } = useWholesaleInquiries({
    status: filters.status,
    q: debouncedQ.trim() || undefined,
    assigned: filters.assigned,
    source: filters.source,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    page,
    pageSize: 20,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / (data?.pageSize ?? 20)))

  const assigneeOptions = useMemo(() => {
    const names = uniqueSorted(items.map((item) => item.assignedTo).filter(Boolean))
    return [
      { value: "all", label: "Tất cả phụ trách" },
      { value: "unassigned", label: "Chưa gán" },
      ...names.map((name) => ({ value: name, label: name })),
    ]
  }, [items])

  const sourceOptions = useMemo(() => {
    const sources = uniqueSorted(items.map((item) => item.source))
    return [
      { value: "all", label: "Tất cả nguồn" },
      ...sources.map((source) => ({ value: source, label: source })),
    ]
  }, [items])

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "assigned",
          value: filters.assigned,
          defaultValue: "all",
          label: "Phụ trách",
          formatValue: (v) => (v === "unassigned" ? "Chưa gán" : v),
        },
        {
          key: "source",
          value: filters.source,
          defaultValue: "all",
          label: "Nguồn",
        },
        { key: "dateFrom", value: filters.dateFrom, defaultValue: "", label: "Từ" },
        { key: "dateTo", value: filters.dateTo, defaultValue: "", label: "Đến" },
      ]),
    [filters]
  )

  const columns: ColumnDef<WholesaleInquiry>[] = [
    {
      accessorKey: "company",
      header: "Công ty",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.company}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.contact} · {row.original.phone}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Số lượng",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.quantity || "—"}</span>
      ),
    },
    {
      accessorKey: "budget",
      header: "Ngân sách",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.budget || "—"}
        </span>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: "Phụ trách",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.assignedTo || "Chưa gán"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <WholesaleStatusBadge status={row.original.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mua sỉ / B2B"
        description="Quản lý yêu cầu báo giá số lượng lớn."
      />

      <StatusFilterTabs<WholesaleStatus | "all">
        value={(filters.status as WholesaleStatus | "all")}
        onChange={(v) => resetPage({ status: v })}
        options={STATUS_TABS}
        counts={data?.statusCounts}
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => resetPage({ q: v })}
        searchPlaceholder="Tìm theo công ty, liên hệ, email, SĐT..."
        advancedFilterCount={countAdvancedFilters(filters, WHOLESALE_FILTER_DEFAULTS, [
          "q",
          "status",
          "page",
        ])}
        sheetTitle="Bộ lọc yêu cầu B2B"
        chips={chips}
        onRemoveChip={(key) =>
          resetPage({
            [key]: WHOLESALE_FILTER_DEFAULTS[key as keyof WholesaleFilterState] ?? "",
          })
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        sheetContent={
          <>
            <FilterSection title="Phân công">
              <FilterField label="Người phụ trách">
                <FilterSelect
                  value={filters.assigned}
                  onChange={(v) => resetPage({ assigned: v })}
                  placeholder="Phụ trách"
                  options={assigneeOptions}
                />
              </FilterField>
              <FilterField label="Nguồn yêu cầu">
                <FilterSelect
                  value={filters.source}
                  onChange={(v) => resetPage({ source: v })}
                  placeholder="Nguồn"
                  options={sourceOptions}
                />
              </FilterField>
            </FilterSection>
            <FilterSection title="Thời gian">
              <FilterDateRange
                stacked
                from={filters.dateFrom}
                to={filters.dateTo}
                onFromChange={(v) => resetPage({ dateFrom: v })}
                onToChange={(v) => resetPage({ dateTo: v })}
              />
            </FilterSection>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        totalCount={total}
        onRowClick={(inquiry) => navigate(`/wholesale/${inquiry.id}`)}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Trang {page} / {totalPages} · {total} yêu cầu
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setFilter("page", String(page - 1))}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setFilter("page", String(page + 1))}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}