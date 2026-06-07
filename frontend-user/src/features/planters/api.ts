import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Planter, PlanterType } from "@/types"

function normalize(p: Planter): Planter {
  return { ...p, id: String(p.id) }
}

async function fetchPlanters(type: PlanterType): Promise<Planter[]> {
  const { data } = await apiClient.get<Planter[]>("/planters", { params: { type } })
  return data.map(normalize)
}

async function fetchPlanter(id: string, type?: PlanterType): Promise<Planter> {
  const { data } = await apiClient.get<Planter>(`/planters/${id}`, {
    params: type ? { type } : undefined,
  })
  return normalize(data)
}

export function usePlanters(type: PlanterType) {
  return useQuery({
    queryKey: queryKeys.planters.list(type),
    queryFn: () => fetchPlanters(type),
  })
}

export function usePlanter(id: string, type?: PlanterType) {
  return useQuery({
    queryKey: queryKeys.planters.detail(id, type),
    queryFn: () => fetchPlanter(id, type),
    enabled: Boolean(id),
  })
}
