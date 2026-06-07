import { useState } from "react"
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
import type { Planter, PlanterType } from "@/types"
import { usePlanters, useDeletePlanter } from "../api"
import { PlanterFormDialog } from "./PlanterFormDialog"

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

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
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
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tạo {noun}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder={`Tìm ${noun}...`}
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
