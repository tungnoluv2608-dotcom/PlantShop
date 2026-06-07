import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatVND } from "@/lib/format"
import type { AdminProduct } from "@/types"
import { useAdminProducts, useDeleteProduct } from "../api"

export function ProductListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminProducts()
  const deleteProduct = useDeleteProduct()
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null)

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

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Tìm theo tên sản phẩm..."
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
