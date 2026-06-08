import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/format"
import type { WholesaleActivity } from "@/types"

const ACTION_LABELS: Record<string, string> = {
  created: "Tạo yêu cầu",
  assigned: "Phân công",
  status_changed: "Đổi trạng thái",
  note_updated: "Cập nhật ghi chú",
  order_created: "Tạo đơn hàng",
}

interface ActivityTimelineProps {
  activities?: WholesaleActivity[]
  isLoading?: boolean
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="rounded-lg border bg-muted/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {ACTION_LABELS[activity.action] ?? activity.action}
              </p>
              {activity.details && (
                <p className="mt-1 text-sm text-muted-foreground">{activity.details}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {activity.actorName} · {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}