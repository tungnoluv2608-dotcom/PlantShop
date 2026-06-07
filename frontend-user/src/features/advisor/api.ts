import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { AdvisorRequest, AdvisorResponse, AdvisorHistoryEntry } from "@/types"
import { useAuthStore } from "@/stores/authStore"

async function runAdvisor(payload: AdvisorRequest): Promise<AdvisorResponse> {
  const { data } = await apiClient.post<AdvisorResponse>("/products/advisor", payload)
  return data
}

async function fetchHistory(): Promise<AdvisorHistoryEntry[]> {
  const { data } = await apiClient.get<AdvisorHistoryEntry[]>("/products/advisor/history")
  return data.map((entry) => ({ ...entry, id: String(entry.id) }))
}

export function useAdvisor() {
  return useMutation({ mutationFn: runAdvisor })
}

export function useAdvisorHistory() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  return useQuery({
    queryKey: queryKeys.advisor.history,
    queryFn: fetchHistory,
    enabled: isAuthenticated,
  })
}
