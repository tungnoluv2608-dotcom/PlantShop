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
import { formatDate } from "@/lib/format"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useListFilters } from "@/hooks/useListFilters"
import { uniqueSorted } from "@/lib/filters"
import type { WholesaleInquiry, WholesaleStatus } from "@/types"
import { WHOLESALE_STATUSES } from "../schema"
import { useWholesaleInquiries } from "../api"
import {
  WHOLESALE_FILTER_DEFAULTS,
  countWholesaleByStatus,
  filterWholesaleInquiries,
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
  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(WHOLESALE_FILTER_DEFAULTS)

  const debouncedQ = useDebouncedValue(filters.q, 350)
  const { data: serverData, isLoading } = useWholesaleInquiries(
    undefined,
    debouncedQ.trim() || undefined
  )

  const clientFiltered = useMemo(
    () => filterWholesaleInquiries(serverData ?? [], filters),
    [serverData, filters]
  )

  const statusCounts = useMemo(
    () => countWholesaleByStatus(serverData ?? []),
    [serverData]
  )

  const assigneeOptions = useMemo(() => {
    const names = uniqueSorted(
      (serverData ?? []).map((item) => item.assignedTo).filter(Boolean)
    )
    return [
      { value: "all", label: "Tất cả phụ trách" },
      { value: "unassigned", label: "Chưa gán" },
      ...names.map((name) => ({ value: name, label: name })),
    ]
  }, [serverData])

  const sourceOptions = useMemo(() => {
    const sources = uniqueSorted((serverData ?? []).map((item) => item.source))
    return [
      { value: "all", label: "Tất cả nguồn" },
      ...sources.map((source) => ({ value: source, label: source })),
    ]
  }, [serverData])

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "assigned",
          value: filters.assigned,
          defaultValue: "all",
          label: "Phụ trách",
          formatValue: (v) =>
            v === "unassigned" ? "Chưa gán" : v,
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
        onChange={(v) => setFilter("status", v)}
        options={STATUS_TABS}
        counts={statusCounts}
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm theo công ty, liên hệ, email, SĐT..."
        advancedFilterCount={countAdvancedFilters(filters, WHOLESALE_FILTER_DEFAULTS, [
          "q",
          "status",
        ])}
        sheetTitle="Bộ lọc yêu cầu B2B"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, WHOLESALE_FILTER_DEFAULTS[key as keyof WholesaleFilterState] ?? "")
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        sheetContent={
          <>
            <FilterSection title="Phân công">
              <FilterField label="Người phụ trách">
                <FilterSelect
                  value={filters.assigned}
                  onChange={(v) => setFilter("assigned", v)}
                  placeholder="Phụ trách"
                  options={assigneeOptions}
                />
              </FilterField>
              <FilterField label="Nguồn yêu cầu">
                <FilterSelect
                  value={filters.source}
                  onChange={(v) => setFilter("source", v)}
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
                onFromChange={(v) => setFilter("dateFrom", v)}
                onToChange={(v) => setFilter("dateTo", v)}
              />
            </FilterSection>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={clientFiltered}
        isLoading={isLoading}
        totalCount={serverData?.length}
        onRowClick={(inquiry) => navigate(`/wholesale/${inquiry.id}`)}
      />
    </div>
  )
}