import { Badge } from "@/components/ui/badge"
import type { CustomerSegment } from "@/types"
import {
  getCustomerSegmentLabel,
  getSegmentBadgeClass,
} from "../customer-segments"

interface CustomerSegmentBadgeProps {
  segment: CustomerSegment
  className?: string
}

export function CustomerSegmentBadge({
  segment,
  className,
}: CustomerSegmentBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${getSegmentBadgeClass(segment)} ${className ?? ""}`}
    >
      {segment === "vip" ? `⭐ ${getCustomerSegmentLabel(segment)}` : getCustomerSegmentLabel(segment)}
    </Badge>
  )
}