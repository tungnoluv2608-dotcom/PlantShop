import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
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
import type { AdminProduct } from "@/types"
import { useAdminProducts, useDeleteProduct } from "../api"
import {
  PRODUCT_FILTER_DEFAULTS,
  filterProducts,
  type ProductFilterState,
} from "../product-filters"

const STOCK_OPTIONS = [
  { value: "all", label: "Tất cả tồn kho" },
  { value: "in_stock", label: "Còn hàng" },
  { value: "out_of_stock", label: "Hết hàng" },
]

const TRI_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "yes", label: "Có" },
  { value: "no", label: "Không" },
]

const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "name_asc", label: "Tên A → Z" },
  { value: "name_desc", label: "Tên Z → A" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
]

export function ProductListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminProducts()
  const deleteProduct = useDeleteProduct()
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null)

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(PRODUCT_FILTER_DEFAULTS)

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả danh mục" },
      ...uniqueSorted((data ?? []).map((p) => p.category)).map((name) => ({
        value: name,
        label: name,
      })),
    ],
    [data]
  )

  const filteredData = useMemo(
    () => filterProducts(data ?? [], filters),
    [data, filters]
  )

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "category",
          value: filters.category,
          defaultValue: "all",
          label: "Danh mục",
        },
        {
          key: "stock",
          value: filters.stock,
          defaultValue: "all",
          label: "Tồn kho",
          formatValue: (v) =>
            STOCK_OPTIONS.find((o) => o.value === v)?.label ?? v,
        },
        {
          key: "discounted",
          value: filters.discounted,
          defaultValue: "all",
          label: "Giảm giá",
          formatValue: (v) => (v === "yes" ? "Có giảm giá" : "Không giảm giá"),
        },
        {
          key: "noPlanter",
          value: filters.noPlanter,
          defaultValue: "all",
          label: "Chậu cây",
          formatValue: (v) => (v === "yes" ? "Chưa gắn chậu" : "Đã gắn chậu"),
        },
        {
          key: "priceMin",
          value: filters.priceMin,
          defaultValue: "",
          label: "Giá từ",
          formatValue: (v) => formatVND(Number(v)),
        },
        {
          key: "priceMax",
          value: filters.priceMax,
          defaultValue: "",
          label: "Giá đến",
          formatValue: (v) => formatVND(Number(v)),
        },
      ]),
    [filters]
  )

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteProduct.mutate(String(pendingDelete.id), {
      onSuccess: (res) => {
        toast.success(res.message)
        setPendingDelete(null)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const columns: ColumnDef<AdminProduct>[] = [
    {
      accessorKey: "title",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.imageUrl}
            alt={row.original.title}
            width={44}
            height={44}
            className="size-11 rounded-lg border border-border object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              #{row.original.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Danh mục",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.category}</span>
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
              <DropdownMenuItem
                onClick={() => navigate(`/products/${row.original.id}/edit`)}
              >
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
        title="Sản phẩm"
        description="Quản lý toàn bộ sản phẩm cây cảnh."
        actions={
          <Button asChild>
            <Link to="/products/new">
              <Plus className="size-4" /> Tạo sản phẩm
            </Link>
          </Button>
        }
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm theo tên, mã, mô tả..."
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => setFilter("sort", v)}
        advancedFilterCount={countAdvancedFilters(filters, PRODUCT_FILTER_DEFAULTS)}
        sheetTitle="Bộ lọc sản phẩm"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, PRODUCT_FILTER_DEFAULTS[key as keyof ProductFilterState] ?? "")
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        quickFilters={
          <FilterSelect
            variant="toolbar"
            value={filters.category}
            onChange={(v) => setFilter("category", v)}
            placeholder="Danh mục"
            options={categoryOptions}
          />
        }
        sheetContent={
          <>
            <FilterSection title="Trạng thái">
              <FilterField label="Tồn kho">
                <FilterSelect
                  value={filters.stock}
                  onChange={(v) => setFilter("stock", v)}
                  placeholder="Tồn kho"
                  options={STOCK_OPTIONS}
                />
              </FilterField>
              <FilterField label="Giảm giá">
                <FilterSelect
                  value={filters.discounted}
                  onChange={(v) => setFilter("discounted", v)}
                  placeholder="Giảm giá"
                  options={TRI_OPTIONS}
                />
              </FilterField>
              <FilterField label="Gắn chậu cây">
                <FilterSelect
                  value={filters.noPlanter}
                  onChange={(v) => setFilter("noPlanter", v)}
                  placeholder="Chậu cây"
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "yes", label: "Chưa gắn chậu" },
                    { value: "no", label: "Đã gắn chậu" },
                  ]}
                />
              </FilterField>
            </FilterSection>
            <FilterSection title="Khoảng giá">
              <FilterNumberRange
                stacked
                min={filters.priceMin}
                max={filters.priceMax}
                onMinChange={(v) => setFilter("priceMin", v)}
                onMaxChange={(v) => setFilter("priceMax", v)}
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Xóa sản phẩm?"
        description={`Bạn có chắc muốn xóa "${pendingDelete?.title}"? Hành động này không thể hoàn tác.`}
        destructive
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteProduct.isPending}
      />
    </div>
  )
}