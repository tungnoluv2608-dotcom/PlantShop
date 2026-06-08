import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, Star } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import {
  ListFilterToolbar,
  FilterSelect,
  FilterField,
  FilterSection,
  FilterDateRange,
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
import { formatDate } from "@/lib/format"
import { uniqueSorted } from "@/lib/filters"
import type { BlogPost } from "@/types"
import { useBlogPosts, useDeleteBlog } from "../api"
import {
  BLOG_FILTER_DEFAULTS,
  filterBlogPosts,
  type BlogFilterState,
} from "../blog-filters"

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "title_asc", label: "Tiêu đề A → Z" },
]

export function BlogListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useBlogPosts()
  const deleteBlog = useDeleteBlog()
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null)

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(BLOG_FILTER_DEFAULTS)

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
    () => filterBlogPosts(data ?? [], filters),
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
          key: "featured",
          value: filters.featured,
          defaultValue: "all",
          label: "Nổi bật",
          formatValue: (v) => (v === "yes" ? "Bài nổi bật" : "Không nổi bật"),
        },
        { key: "dateFrom", value: filters.dateFrom, defaultValue: "", label: "Từ" },
        { key: "dateTo", value: filters.dateTo, defaultValue: "", label: "Đến" },
      ]),
    [filters]
  )

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteBlog.mutate(String(pendingDelete.id), {
      onSuccess: (res) => {
        toast.success(res.message)
        setPendingDelete(null)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: "title",
      header: "Bài viết",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.image}
            alt={row.original.title}
            width={56}
            height={40}
            className="h-10 w-14 rounded-md border border-border object-cover"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium">
              {row.original.featured && (
                <Star className="size-3.5 fill-accent text-accent" />
              )}
              {row.original.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.readTime}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Danh mục",
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      accessorKey: "date",
      header: "Ngày đăng",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.date)}
        </span>
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
              <DropdownMenuItem onClick={() => navigate(`/blog/${row.original.id}/edit`)}>
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
        title="Góc xanh"
        description="Quản lý bài viết và nội dung Góc xanh."
        actions={
          <Button asChild>
            <Link to="/blog/new">
              <Plus className="size-4" /> Tạo bài viết
            </Link>
          </Button>
        }
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm theo tiêu đề, tags, excerpt..."
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => setFilter("sort", v)}
        advancedFilterCount={countAdvancedFilters(filters, BLOG_FILTER_DEFAULTS)}
        sheetTitle="Bộ lọc bài viết"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, BLOG_FILTER_DEFAULTS[key as keyof BlogFilterState] ?? "")
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
            <FilterSection title="Nội dung">
              <FilterField label="Bài nổi bật">
                <FilterSelect
                  value={filters.featured}
                  onChange={(v) => setFilter("featured", v)}
                  placeholder="Nổi bật"
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "yes", label: "Bài nổi bật" },
                    { value: "no", label: "Không nổi bật" },
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
        title="Xóa bài viết?"
        description={`Xóa "${pendingDelete?.title}"? Hành động này không thể hoàn tác.`}
        destructive
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteBlog.isPending}
      />
    </div>
  )
}