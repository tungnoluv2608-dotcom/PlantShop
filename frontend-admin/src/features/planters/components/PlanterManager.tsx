import { useMemo, useState } from "react"
import { Link } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import {
  ListFilterToolbar,
  FilterSelect,
  FilterField,
  FilterSection,
  FilterNumberRange,
  buildFilterChips,
  countAdvancedFilters,
} from "@/components/common/FilterBar"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useListFilters } from "@/hooks/useListFilters"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatVND } from "@/lib/format"
import { uniqueSorted } from "@/lib/filters"
import type { Planter, PlanterType } from "@/types"
import { usePlanters, useDeletePlanter } from "../api"
import { PlanterFormDialog } from "./PlanterFormDialog"
import {
  PLANTER_FILTER_DEFAULTS,
  filterPlanters,
  type PlanterFilterState,
} from "../planter-filters"

const URL_DEFAULTS: Record<string, string> = { ...PLANTER_FILTER_DEFAULTS }

const STOCK_OPTIONS = [
  { value: "all", label: "Tất cả tồn kho" },
  { value: "in_stock", label: "Còn hàng" },
  { value: "out_of_stock", label: "Hết hàng" },
]

const SORT_OPTIONS = [
  { value: "name_asc", label: "Tên A → Z" },
  { value: "name_desc", label: "Tên Z → A" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
]

interface PlanterManagerProps {
  type: PlanterType
}

export function PlanterManager({ type }: PlanterManagerProps) {
  const { data, isLoading } = usePlanters(type)
  const deletePlanter = useDeletePlanter()

  const [editing, setEditing] = useState<Planter | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Planter | null>(null)

  const isAccessory = type === "accessory"
  const noun = isAccessory ? "phụ kiện" : "chậu cây"
  const filterPrefix = isAccessory ? "accessory" : "planter"

  const urlDefaults = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(URL_DEFAULTS).map(([key, value]) => [
          `${filterPrefix}_${key}`,
          value,
        ])
      ),
    [filterPrefix]
  )

  const { values, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(urlDefaults)

  const filters = useMemo((): PlanterFilterState => {
    const prefixed = values
    return {
      q: prefixed[`${filterPrefix}_q`] ?? "",
      material: prefixed[`${filterPrefix}_material`] ?? "all",
      brand: prefixed[`${filterPrefix}_brand`] ?? "all",
      usageTag: prefixed[`${filterPrefix}_usageTag`] ?? "all",
      size: prefixed[`${filterPrefix}_size`] ?? "all",
      stock: (prefixed[`${filterPrefix}_stock`] ?? "all") as PlanterFilterState["stock"],
      priceMin: prefixed[`${filterPrefix}_priceMin`] ?? "",
      priceMax: prefixed[`${filterPrefix}_priceMax`] ?? "",
      sort: prefixed[`${filterPrefix}_sort`] ?? "name_asc",
    }
  }, [values, filterPrefix])

  const setPlanterFilter = (key: keyof PlanterFilterState, value: string) => {
    setFilter(`${filterPrefix}_${key}`, value)
  }

  const clearPlanterFilters = () => clearFilters()

  const materialOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả chất liệu" },
      ...uniqueSorted((data ?? []).map((item) => item.material)).map((m) => ({
        value: m,
        label: m,
      })),
    ],
    [data]
  )

  const brandOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả thương hiệu" },
      ...uniqueSorted(
        (data ?? []).map((item) => item.accessoryBrand ?? "").filter(Boolean)
      ).map((b) => ({ value: b, label: b })),
    ],
    [data]
  )

  const usageTagOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả công dụng" },
      ...uniqueSorted((data ?? []).flatMap((item) => item.usageTags ?? [])).map(
        (tag) => ({ value: tag, label: tag })
      ),
    ],
    [data]
  )

  const sizeOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả kích thước" },
      ...uniqueSorted((data ?? []).flatMap((item) => item.sizes ?? [])).map(
        (size) => ({ value: size, label: size })
      ),
    ],
    [data]
  )

  const filteredData = useMemo(
    () => filterPlanters(data ?? [], filters, type),
    [data, filters, type]
  )

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: `${filterPrefix}_material`,
          value: filters.material,
          defaultValue: "all",
          label: "Chất liệu",
        },
        ...(isAccessory
          ? [
              {
                key: `${filterPrefix}_brand`,
                value: filters.brand,
                defaultValue: "all",
                label: "Thương hiệu",
              },
              {
                key: `${filterPrefix}_usageTag`,
                value: filters.usageTag,
                defaultValue: "all",
                label: "Công dụng",
              },
            ]
          : [
              {
                key: `${filterPrefix}_size`,
                value: filters.size,
                defaultValue: "all",
                label: "Kích thước",
              },
            ]),
        {
          key: `${filterPrefix}_stock`,
          value: filters.stock,
          defaultValue: "all",
          label: "Tồn kho",
          formatValue: (v: string) =>
            STOCK_OPTIONS.find((o) => o.value === v)?.label ?? v,
        },
      ]),
    [filters, filterPrefix, isAccessory]
  )

  const createHref = isAccessory ? "/accessories/new" : "/planters/new"

  const createAction = (
    <Button asChild>
      <Link to={createHref}>
        <Plus className="size-4" /> Tạo {noun}
      </Link>
    </Button>
  )
  const openEdit = (item: Planter) => {
    setEditing(item)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deletePlanter.mutate(String(pendingDelete.id), {
      onSuccess: (res) => {
        toast.success(res.message)
        setPendingDelete(null)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const columns: ColumnDef<Planter>[] = [
    {
      accessorKey: "name",
      header: "Tên",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.imageUrl}
            alt={row.original.name}
            width={44}
            height={44}
            className="size-11 rounded-lg border border-border object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.material}
            </p>
          </div>
        </div>
      ),
    },
    isAccessory
      ? {
          accessorKey: "usageTags",
          header: "Công dụng",
          cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
              {(row.original.usageTags ?? []).length === 0 ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : (
                (row.original.usageTags ?? []).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))
              )}
            </div>
          ),
        }
      : {
          accessorKey: "sizes",
          header: "Kích thước",
          cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
              {(row.original.sizes ?? []).length === 0 ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : (
                (row.original.sizes ?? []).map((size) => (
                  <Badge key={size} variant="outline">
                    {size}
                  </Badge>
                ))
              )}
            </div>
          ),
        },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => (
        <span className="font-medium">{formatVND(row.original.price)}</span>
      ),
    },
    {
      accessorKey: "stockQuantity",
      header: "Số lượng",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">{row.original.stockQuantity ?? 0}</span>
      ),
    },
    {
      accessorKey: "inStock",
      header: "Trạng thái",
      cell: ({ row }) =>
        row.original.inStock ? (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800">
            Còn hàng
          </Badge>
        ) : (
          <Badge variant="outline" className="border-rose-200 bg-rose-100 text-rose-800">
            Hết hàng
          </Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(row.original)}>
                <Pencil className="size-4" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setPendingDelete(row.original)}
              >
                <Trash2 className="size-4" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAccessory ? "Phụ kiện" : "Chậu cây"}
        description={
          isAccessory
            ? "Quản lý phụ kiện chăm sóc cây."
            : "Quản lý chậu cây kèm theo sản phẩm."
        }
        actions={createAction}
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setPlanterFilter("q", v)}
        searchPlaceholder={`Tìm ${noun}, chất liệu...`}
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => setPlanterFilter("sort", v)}
        advancedFilterCount={countAdvancedFilters(filters, PLANTER_FILTER_DEFAULTS)}
        sheetTitle={`Bộ lọc ${noun}`}
        chips={chips}
        onRemoveChip={(key) => setFilter(key, urlDefaults[key] ?? "")}
        onClearAll={clearPlanterFilters}
        hasActiveFilters={hasActiveFilters}
        quickFilters={
          <FilterSelect
            variant="toolbar"
            value={filters.material}
            onChange={(v) => setPlanterFilter("material", v)}
            placeholder="Chất liệu"
            options={materialOptions}
          />
        }
        sheetContent={
          <>
            <FilterSection title="Phân loại">
              {isAccessory ? (
                <>
                  <FilterField label="Thương hiệu">
                    <FilterSelect
                      value={filters.brand}
                      onChange={(v) => setPlanterFilter("brand", v)}
                      placeholder="Thương hiệu"
                      options={brandOptions}
                    />
                  </FilterField>
                  <FilterField label="Công dụng">
                    <FilterSelect
                      value={filters.usageTag}
                      onChange={(v) => setPlanterFilter("usageTag", v)}
                      placeholder="Công dụng"
                      options={usageTagOptions}
                    />
                  </FilterField>
                </>
              ) : (
                <FilterField label="Kích thước">
                  <FilterSelect
                    value={filters.size}
                    onChange={(v) => setPlanterFilter("size", v)}
                    placeholder="Kích thước"
                    options={sizeOptions}
                  />
                </FilterField>
              )}
              <FilterField label="Tồn kho">
                <FilterSelect
                  value={filters.stock}
                  onChange={(v) => setPlanterFilter("stock", v)}
                  placeholder="Tồn kho"
                  options={STOCK_OPTIONS}
                />
              </FilterField>
            </FilterSection>
            <FilterSection title="Giá">
              <FilterNumberRange
                stacked
                min={filters.priceMin}
                max={filters.priceMax}
                onMinChange={(v) => setPlanterFilter("priceMin", v)}
                onMaxChange={(v) => setPlanterFilter("priceMax", v)}
                minLabel="Giá từ (₫)"
                maxLabel="Giá đến (₫)"
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

      <PlanterFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={type}
        item={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Xóa ${noun}?`}
        description={`Xóa "${pendingDelete?.name}"? Hành động này không thể hoàn tác.`}
        destructive
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deletePlanter.isPending}
      />
    </div>
  )
}