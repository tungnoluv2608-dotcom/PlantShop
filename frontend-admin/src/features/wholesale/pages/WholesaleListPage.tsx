import { useState } from "react"
import { useNavigate } from "react-router"
import { type ColumnDef } from "@tanstack/react-table"

import { PageHeader } from "@/components/common/PageHeader"
import { DataTable } from "@/components/common/DataTable"
import { WholesaleStatusBadge, WHOLESALE_STATUS } from "@/components/common/StatusBadge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/format"
import type { WholesaleInquiry } from "@/types"
import { WHOLESALE_STATUSES } from "../schema"
import { useWholesaleInquiries } from "../api"

export function WholesaleListPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>("all")
  const { data, isLoading } = useWholesaleInquiries(
    status === "all" ? undefined : status
  )

  const columns: ColumnDef<WholesaleInquiry>[] = [
    {
      accessorKey: "company",
      header: "Công ty",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.company}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.contact} · {row.original.phone}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Số lượng",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.quantity || "—"}</span>
      ),
    },
    {
      accessorKey: "budget",
      header: "Ngân sách",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.budget || "—"}
        </span>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: "Phụ trách",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.assignedTo || "Chưa gán"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <WholesaleStatusBadge status={row.original.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mua sỉ / B2B"
        description="Quản lý yêu cầu báo giá số lượng lớn."
      />

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchKey="company"
        searchPlaceholder="Tìm theo công ty..."
        onRowClick={(inquiry) => navigate(`/wholesale/${inquiry.id}`)}
        toolbar={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {WHOLESALE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {WHOLESALE_STATUS[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
