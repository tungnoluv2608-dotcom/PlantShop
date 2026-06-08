import { useMemo, useState } from "react"
import { Link } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, BarChart3 } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import {
  ListFilterToolbar,
  FilterSelect,
  FilterField,
  FilterSection,
  buildFilterChips,
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
import { formatDateTime } from "@/lib/format"
import type { Voucher } from "@/types"
import { useVouchers, useDeleteVoucher } from "../api"
import { VoucherFormDialog } from "../components/VoucherFormDialog"
import {
  VOUCHER_FILTER_DEFAULTS,
  filterVouchers,
  formatDiscountLabel,
  type VoucherFilterState,
} from "../voucher-filters"

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hiệu lực" },
  { value: "scheduled", label: "Chưa bắt đầu" },
  { value: "expired", label: "Đã hết hạn" },
  { value: "inactive", label: "Đã tắt" },
]

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "percent", label: "Phần trăm" },
  { value: "fixed", label: "Số tiền" },
  { value: "freeship", label: "Freeship" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "code_asc", label: "Mã A → Z" },
  { value: "usage_desc", label: "Nhiều lượt dùng" },
  { value: "expires_asc", label: "Sắp hết hạn" },
]

function statusBadge(voucher: Voucher) {
  const now = Date.now()
  const starts = new Date(voucher.startsAt).getTime()
  const expires = new Date(voucher.expiresAt).getTime()
  if (!voucher.isActive) return <Badge variant="secondary">Đã tắt</Badge>
  if (now > expires) return <Badge variant="destructive">Hết hạn</Badge>
  if (now < starts) return <Badge variant="outline">Chưa bắt đầu</Badge>
  return <Badge className="bg-emerald-600 hover:bg-emerald-600">Hiệu lực</Badge>
}

export function VoucherListPage() {
  const { data, isLoading } = useVouchers()
  const deleteVoucher = useDeleteVoucher()

  const [editing, setEditing] = useState<Voucher | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Voucher | null>(null)

  const { values: filters, setFilter, clearFilters, hasActiveFilters } =
    useListFilters(VOUCHER_FILTER_DEFAULTS)

  const filteredData = useMemo(
    () => filterVouchers(data ?? [], filters),
    [data, filters],
  )

  const chips = useMemo(
    () =>
      buildFilterChips([
        {
          key: "status",
          value: filters.status,
          defaultValue: "all",
          label: "Trạng thái",
          formatValue: (v) => STATUS_OPTIONS.find((o) => o.value === v)?.label ?? String(v),
        },
        {
          key: "discountType",
          value: filters.discountType,
          defaultValue: "all",
          label: "Loại",
          formatValue: (v) => TYPE_OPTIONS.find((o) => o.value === v)?.label ?? String(v),
        },
      ]),
    [filters],
  )

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (voucher: Voucher) => {
    setEditing(voucher)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteVoucher.mutate(String(pendingDelete.id), {
      onSuccess: (res) => {
        toast.success(res.message)
        setPendingDelete(null)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const columns: ColumnDef<Voucher>[] = [
    {
      accessorKey: "code",
      header: "Mã",
      cell: ({ row }) => (
        <div>
          <p className="font-mono font-medium">{row.original.code}</p>
          <p className="text-xs text-muted-foreground">{row.original.name}</p>
        </div>
      ),
    },
    {
      id: "discount",
      header: "Ưu đãi",
      cell: ({ row }) => formatDiscountLabel(row.original),
    },
    {
      id: "usage",
      header: "Lượt dùng",
      cell: ({ row }) => {
        const used = row.original.usedCount ?? 0
        const limit = row.original.usageLimit
        return limit ? `${used} / ${limit}` : String(used)
      },
    },
    {
      id: "period",
      header: "Thời hạn",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          <p>{formatDateTime(row.original.startsAt)}</p>
          <p>→ {formatDateTime(row.original.expiresAt)}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => statusBadge(row.original),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/vouchers/${row.original.id}`}>
                <BarChart3 className="mr-2 size-4" /> Báo cáo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="mr-2 size-4" /> Sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setPendingDelete(row.original)}
            >
              <Trash2 className="mr-2 size-4" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voucher"
        description="Quản lý mã giảm giá, freeship và theo dõi hiệu quả chiến dịch."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tạo voucher
          </Button>
        }
      />

      <ListFilterToolbar
        search={filters.q}
        onSearchChange={(v) => setFilter("q", v)}
        searchPlaceholder="Tìm theo mã, tên..."
        sort={filters.sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={(v) => setFilter("sort", v as VoucherFilterState["sort"])}
        sheetTitle="Bộ lọc voucher"
        chips={chips}
        onRemoveChip={(key) =>
          setFilter(key, VOUCHER_FILTER_DEFAULTS[key as keyof VoucherFilterState] ?? "")
        }
        onClearAll={clearFilters}
        hasActiveFilters={hasActiveFilters}
        advancedFilterCount={
          (filters.status !== "all" ? 1 : 0) + (filters.discountType !== "all" ? 1 : 0)
        }
        sheetContent={
          <FilterSection title="Thuộc tính">
            <FilterField label="Trạng thái">
              <FilterSelect
                value={filters.status}
                placeholder="Trạng thái"
                options={STATUS_OPTIONS}
                onChange={(v) => setFilter("status", v as VoucherFilterState["status"])}
              />
            </FilterField>
            <FilterField label="Loại giảm">
              <FilterSelect
                value={filters.discountType}
                placeholder="Loại giảm"
                options={TYPE_OPTIONS}
                onChange={(v) => setFilter("discountType", v as VoucherFilterState["discountType"])}
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

      <VoucherFormDialog open={dialogOpen} onOpenChange={setDialogOpen} voucher={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Xóa voucher?"
        description={`Bạn có chắc muốn xóa hoặc vô hiệu hóa mã ${pendingDelete?.code}?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        destructive
        isLoading={deleteVoucher.isPending}
      />
    </div>
  )
}