import { useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatDate } from "@/lib/format"
import type { AdminReview } from "@/types"
import { useAdminReviews, useModerateReview, useDeleteReview } from "../api"

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

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchKey="productTitle"
        searchPlaceholder="Tìm theo sản phẩm..."
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
