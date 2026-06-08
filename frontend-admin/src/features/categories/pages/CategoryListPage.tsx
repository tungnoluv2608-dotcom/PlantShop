import { useMemo, useState } from "react"
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
import type { Category } from "@/types"
import { useCategories, useDeleteCategory } from "../api"
import { CategoryFormDialog } from "../components/CategoryFormDialog"
import {
  CATEGORY_FILTER_DEFAULTS,
  filterCategories,
  type CategoryFilterState,
} from "../category-filters"

const TRI_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "yes", label: "Có" },
  { value: "no", label: "Không" },
]

const SORT_OPTIONS = [
  { value: "name_asc", label: "Tên A → Z" },
  { value: "name_desc", label: "Tên Z → A" },
  { value: "subcategories_desc", label: "Nhiều danh mục con" },
]

export function CategoryListPage() {
  const { data, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()

  const [editing, setEditing] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(CATEGORY_FILTER_DEFAULTS)

  const filteredData = useMemo(
    () => filterCategories(data ?? [], filters),
    [data, filters]
  )

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "hasSubcategories",
          value: filters.hasSubcategories,
          defaultValue: "all",
          label: "Danh mục con",
          formatValue: (v) => (v === "yes" ? "Có danh mục con" : "Không có"),
        },
        {
          key: "hasImage",
          value: filters.hasImage,
          defaultValue: "all",
          label: "Ảnh",
          formatValue: (v) => (v === "yes" ? "Có ảnh" : "Không ảnh"),
        },
      ]),
    [filters]
  )

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (category: Category) => {
    setEditing(category)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteCategory.mutate(String(pendingDelete.id), {
      onSuccess: (res) => {
        toast.success(res.message)
        setPendingDelete(null)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Danh mục",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
              width={40}
              height={40}
              className="size-10 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="size-10 rounded-lg bg-muted" />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "subcategories",
      header: "Danh mục con",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.subcategories.length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            row.original.subcategories.map((sub) => (
              <Badge key={sub} variant="outline">
                {sub}
              </Badge>
            ))
          )}
        </div>
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
        title="Danh mục"
        description="Quản lý danh mục và danh mục con của sản phẩm."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tạo danh mục
          </Button>
        }
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm danh mục hoặc danh mục con..."
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => setFilter("sort", v)}
        advancedFilterCount={countAdvancedFilters(filters, CATEGORY_FILTER_DEFAULTS)}
        sheetTitle="Bộ lọc danh mục"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, CATEGORY_FILTER_DEFAULTS[key as keyof CategoryFilterState] ?? "")
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        sheetContent={
          <FilterSection title="Thuộc tính">
            <FilterField label="Có danh mục con">
              <FilterSelect
                value={filters.hasSubcategories}
                onChange={(v) => setFilter("hasSubcategories", v)}
                placeholder="Danh mục con"
                options={TRI_OPTIONS}
              />
            </FilterField>
            <FilterField label="Có ảnh đại diện">
              <FilterSelect
                value={filters.hasImage}
                onChange={(v) => setFilter("hasImage", v)}
                placeholder="Ảnh"
                options={TRI_OPTIONS}
              />
            </FilterField>
          </FilterSection>
        }
      />

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        totalCount={data?.length}
      />

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Xóa danh mục?"
        description={`Xóa "${pendingDelete?.name}"? Sản phẩm thuộc danh mục này có thể bị ảnh hưởng.`}
        destructive
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}