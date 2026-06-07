import { type ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatVND, formatDate } from "@/lib/format"
import type { Customer } from "@/types"
import { useCustomers } from "../api"

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function CustomerListPage() {
  const { data, isLoading } = useCustomers()

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "orderCount",
      header: "Số đơn",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.orderCount}</span>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "Tổng chi tiêu",
      cell: ({ row }) => (
        <span className="font-semibold">{formatVND(row.original.totalSpent)}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Ngày tham gia",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Khách hàng" description="Danh sách khách hàng và chi tiêu." />
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Tìm khách hàng..."
      />
    </div>
  )
}
