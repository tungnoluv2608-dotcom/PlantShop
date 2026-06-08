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
import type { ShippingZone } from "@/types"
import { useShippingZones, useDeleteShippingZone } from "../api"
import { ShippingZoneFormDialog } from "../components/ShippingZoneFormDialog"

function formatCoverage(zone: ShippingZone) {
  if (!zone.province && !zone.district) return "Toàn quốc (mặc định)"
  if (zone.province && !zone.district) return zone.province
  return `${zone.district}, ${zone.province}`
}

export function ShippingZoneListPage() {
  const { data, isLoading } = useShippingZones()
  const deleteZone = useDeleteShippingZone()

  const [editing, setEditing] = useState<ShippingZone | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ShippingZone | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (zone: ShippingZone) => {
    setEditing(zone)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteZone.mutate(String(pendingDelete.id), {
      onSuccess: (res) => {
        toast.success(res.message)
        setPendingDelete(null)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const columns: ColumnDef<ShippingZone>[] = [
    {
      accessorKey: "name",
      header: "Tên vùng",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{formatCoverage(row.original)}</p>
        </div>
      ),
    },
    {
      id: "fees",
      header: "Phí ship",
      cell: ({ row }) => (
        <div className="text-sm">
          <p>TC: {formatVND(row.original.standardFee)}</p>
          <p className="text-muted-foreground">
            Nhanh: {formatVND(row.original.expressFee)} · Trong ngày:{" "}
            {row.original.allowsSameday ? formatVND(row.original.samedayFee) : "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Ưu tiên",
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Đang dùng" : "Tắt"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Thao tác">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="mr-2 size-4" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setPendingDelete(row.original)}
            >
              <Trash2 className="mr-2 size-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Vùng vận chuyển"
        description="Cấu hình phí ship theo tỉnh/thành và quận/huyện. Vùng ưu tiên cao hơn được áp dụng trước."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Thêm vùng
          </Button>
        }
      />

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} />

      <ShippingZoneFormDialog open={dialogOpen} onOpenChange={setDialogOpen} zone={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Xóa vùng vận chuyển?"
        description={
          pendingDelete
            ? `Bạn có chắc muốn xóa "${pendingDelete.name}"? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa"
        destructive
        onConfirm={handleDelete}
        isLoading={deleteZone.isPending}
      />
    </>
  )
}