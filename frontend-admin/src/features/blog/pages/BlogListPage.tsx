import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Trash2, MoreHorizontal, Star } from "lucide-react"
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
import { formatDate } from "@/lib/format"
import type { BlogPost } from "@/types"
import { useBlogPosts, useDeleteBlog } from "../api"

export function BlogListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useBlogPosts()
  const deleteBlog = useDeleteBlog()
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null)

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

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Tìm bài viết..."
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
