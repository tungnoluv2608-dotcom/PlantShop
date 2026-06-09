export const VIP_SPENT_THRESHOLD = 5_000_000;
export const VIP_DELIVERED_ORDER_THRESHOLD = 5;
export const LOYAL_DELIVERED_ORDER_THRESHOLD = 3;
export const NEW_CUSTOMER_DAYS = 7;

export type CustomerSegment = "vip" | "loyal" | "new" | "regular";

export interface CustomerSegmentInput {
  totalSpent: number;
  deliveredOrderCount?: number;
  created_at: string;
  segment?: CustomerSegment;
}

function isWithinDays(dateValue: string, days: number): boolean {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function resolveCustomerSegment(customer: CustomerSegmentInput): CustomerSegment {
  if (customer.segment) return customer.segment;

  const delivered = customer.deliveredOrderCount ?? 0;
  if (
    customer.totalSpent >= VIP_SPENT_THRESHOLD ||
    delivered >= VIP_DELIVERED_ORDER_THRESHOLD
  ) {
    return "vip";
  }
  if (delivered >= LOYAL_DELIVERED_ORDER_THRESHOLD) {
    return "loyal";
  }
  if (isWithinDays(customer.created_at, NEW_CUSTOMER_DAYS)) {
    return "new";
  }
  return "regular";
}

export function getCustomerSegmentLabel(segment: CustomerSegment): string {
  switch (segment) {
    case "vip":
      return "Khách VIP";
    case "loyal":
      return "Khách thân thiết";
    case "new":
      return "Khách mới";
    default:
      return "Khách hàng";
  }
}

export function getSegmentBadgeClass(segment: CustomerSegment): string {
  switch (segment) {
    case "vip":
      return "bg-amber-500/10 text-amber-500 border-amber-500/25";
    case "loyal":
      return "bg-blue-500/10 text-blue-400 border-blue-500/25";
    case "new":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
    default:
      return "bg-secondary/20 text-muted-foreground border-border";
  }
}