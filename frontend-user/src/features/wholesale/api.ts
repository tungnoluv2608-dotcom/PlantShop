import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { WholesaleInterestItem } from "./schema"

export interface WholesalePayload {
  company: string
  contact: string
  phone: string
  email: string
  quantity: string
  type: string
  location: string
  budget: string
  timeline: string
  note: string
  interestedCategories: WholesaleInterestItem[]
  interestedProducts: WholesaleInterestItem[]
}

export function useSubmitWholesale() {
  return useMutation({
    mutationFn: async (payload: WholesalePayload) => {
      const { data } = await apiClient.post<{ id: string; message: string }>(
        "/wholesale-inquiries",
        payload,
      )
      return data
    },
  })
}