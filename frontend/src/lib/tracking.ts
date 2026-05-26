import type { Order } from "../types";

export const trackingProviderLabels: Record<NonNullable<Order["trackingProvider"]>, string> = {
  ghn: "GHN",
  ghtk: "GHTK",
  viettelpost: "Viettel Post",
  other: "Đơn vị khác",
};

export const trackingProviderOptions = [
  { value: "ghn", label: trackingProviderLabels.ghn },
  { value: "ghtk", label: trackingProviderLabels.ghtk },
  { value: "viettelpost", label: trackingProviderLabels.viettelpost },
  { value: "other", label: trackingProviderLabels.other },
] as const;
