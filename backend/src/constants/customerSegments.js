/** Shared customer segment thresholds for admin APIs. */

const VIP_SPENT_THRESHOLD = 5_000_000;
const VIP_DELIVERED_ORDER_THRESHOLD = 5;
const LOYAL_DELIVERED_ORDER_THRESHOLD = 3;
const NEW_CUSTOMER_DAYS = 7;

const VALID_ORDER_STATUS_SQL = "o.status <> 'cancelled'";

function isWithinDays(dateValue, days) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function resolveCustomerSegment({ totalSpent, deliveredOrderCount, createdAt }) {
  if (
    Number(totalSpent) >= VIP_SPENT_THRESHOLD ||
    Number(deliveredOrderCount) >= VIP_DELIVERED_ORDER_THRESHOLD
  ) {
    return "vip";
  }
  if (Number(deliveredOrderCount) >= LOYAL_DELIVERED_ORDER_THRESHOLD) {
    return "loyal";
  }
  if (isWithinDays(createdAt, NEW_CUSTOMER_DAYS)) {
    return "new";
  }
  return "regular";
}

function getSegmentLabel(segment) {
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

module.exports = {
  VIP_SPENT_THRESHOLD,
  VIP_DELIVERED_ORDER_THRESHOLD,
  LOYAL_DELIVERED_ORDER_THRESHOLD,
  NEW_CUSTOMER_DAYS,
  VALID_ORDER_STATUS_SQL,
  resolveCustomerSegment,
  getSegmentLabel,
};