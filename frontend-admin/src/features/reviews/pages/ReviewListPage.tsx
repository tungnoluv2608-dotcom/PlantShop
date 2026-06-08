import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useListFilters } from "@/hooks/useListFilters"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatDate } from "@/lib/format"
import type { AdminReview } from "@/types"
import { useAdminReviews, useModerateReview, useDeleteReview } from "../api"
import {
  REVIEW_FILTER_DEFAULTS,
  filterReviews,
  type ReviewFilterState,
} from "../review-filters"

const VERIFIED_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "yes", label: "Đã duyệt" },
  { value: "no", label: "Chờ duyệt" },
]

const RATING_OPTIONS = [
  { value: "all", label: "Tất cả sao" },
  ...Array.from({ length: 5 }, (_, i) => ({
    value: String(5 - i),
    label: `${5 - i} sao`,
  })),
]

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "rating_asc", label: "Sao thấp → cao" },
  { value: "rating_desc", label: "Sao cao → thấp" },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rating ? "fill-accent text-accent" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

export function ReviewListPage() {
  const { data, isLoading } = useAdminReviews()
  const moderate = useModerateReview()
  const deleteReview = useDeleteReview()
  const [pendingDelete, setPendingDelete] = useState<AdminReview | null>(null)

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(REVIEW_FILTER_DEFAULTS)

  const filteredData = useMemo(
    () => filterReviews(data ?? [], filters),
    [data, filters]
  )

  const verifiedCounts = useMemo(() => {
    const all = data ?? []
    return {
      all: all.length,
      yes: all.filter((r) => r.verified).length,
      no: all.filter((r) => !r.verified).length,
    }
  }, [data])

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "rating",
          value: filters.rating,
          defaultValue: "all",
          label: "Sao",
          formatValue: (v) => `${v} sao`,
        },
        {
          key: "visible",
          value: filters.visible,
          defaultValue: "all",
          label: "Hiển thị",
          formatValue: (v) => (v === "yes" ? "Đang hiển thị" : "Đã ẩn"),
        },
        {
          key: "hasImages",
          value: filters.hasImages,
          defaultValue: "all",
          label: "Ảnh",
          formatValue: (v) => (v === "yes" ? "Có ảnh" : "Không ảnh"),
        },
        { key: "dateFrom", value: filters.dateFrom, defaultValue: "", label: "Từ" },
        { key: "dateTo", value: filters.dateTo, defaultValue: "", label: "Đến" },
      ]),
    [filters]
  )

  const toggle = (
    review: AdminReview,
    key: "verified" | "visible",
    value: boolean
  ) => {
    moderate.mutate(
      { id: String(review.id), payload: { [key]: value } },
      {
        onSuccess: (res) => toast.success(res.message),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteReview.mutate(String(pendingDelete.id), {
      onSuccess: (res) => {
        toast.success(res.message)
        setPendingDelete(null)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const columns: ColumnDef<AdminReview>[] = [
    {
      accessorKey: "productTitle",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.productTitle}</span>
      ),
    },
    {
      accessorKey: "userName",
      header: "Người đánh giá",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.original.userName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Đánh giá",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Stars rating={row.original.rating} />
          <p className="max-w-xs truncate text-sm font-medium">{row.original.title}</p>
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {row.original.content}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "verified",
      header: "Đã duyệt",
      cell: ({ row }) => (
        <Switch
          checked={row.original.verified}
          disabled={moderate.isPending}
          onCheckedChange={(value) => toggle(row.original, "verified", value)}
        />
      ),
    },
    {
      accessorKey: "visible",
      header: "Hiển thị",
      cell: ({ row }) => (
        <Switch
          checked={row.original.visible}
          disabled={moderate.isPending}
          onCheckedChange={(value) => toggle(row.original, "visible", value)}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPendingDelete(row.original)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đánh giá"
        description="Kiểm duyệt và quản lý đánh giá sản phẩm."
      />

      <StatusFilterTabs
        value={filters.verified}
        onChange={(v) => setFilter("verified", v)}
        options={VERIFIED_TABS}
        counts={verifiedCounts}
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm theo sản phẩm, người đánh giá..."
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => setFilter("sort", v)}
        advancedFilterCount={countAdvancedFilters(filters, REVIEW_FILTER_DEFAULTS, [
          "q",
          "sort",
          "verified",
        ])}
        sheetTitle="Bộ lọc đánh giá"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, REVIEW_FILTER_DEFAULTS[key as keyof ReviewFilterState] ?? "")
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        quickFilters={
          <FilterSelect
            variant="toolbar"
            value={filters.rating}
            onChange={(v) => setFilter("rating", v)}
            placeholder="Số sao"
            options={RATING_OPTIONS}
          />
        }
        sheetContent={
          <>
            <FilterSection title="Hiển thị">
              <FilterField label="Trạng thái hiển thị">
                <FilterSelect
                  value={filters.visible}
                  onChange={(v) => setFilter("visible", v)}
                  placeholder="Hiển thị"
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "yes", label: "Đang hiển thị" },
                    { value: "no", label: "Đã ẩn" },
                  ]}
                />
              </FilterField>
              <FilterField label="Ảnh đính kèm">
                <FilterSelect
                  value={filters.hasImages}
                  onChange={(v) => setFilter("hasImages", v)}
                  placeholder="Ảnh"
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "yes", label: "Có ảnh" },
                    { value: "no", label: "Không ảnh" },
                  ]}
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
        data={filteredData}
        isLoading={isLoading}
        totalCount={data?.length}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Xóa đánh giá?"
        description="Đánh giá này sẽ bị xóa vĩnh viễn."
        destructive
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteReview.isPending}
      />
    </div>
  )
}