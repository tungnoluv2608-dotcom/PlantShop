export interface WholesaleFilterState {
  [key: string]: string
  q: string
  status: string
  assigned: string
  source: string
  dateFrom: string
  dateTo: string
  page: string
}

export const WHOLESALE_FILTER_DEFAULTS: WholesaleFilterState = {
  q: "",
  status: "all",
  assigned: "all",
  source: "all",
  dateFrom: "",
  dateTo: "",
  page: "1",
}

/** Stable reference for useListFilters — avoids recreating defaults each render. */
export const WHOLESALE_LIST_FILTER_DEFAULTS = WHOLESALE_FILTER_DEFAULTS