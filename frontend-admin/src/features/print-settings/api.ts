import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { PrintSettings, PrintSettingsPayload } from "@/types"

interface PrintSettingsResponse {
  message: string
  settings: PrintSettings
}

export function usePrintSettings() {
  return useQuery({
    queryKey: queryKeys.printSettings,
    queryFn: async () => {
      const { data } = await apiClient.get<PrintSettings>("/admin/print-settings")
      return data
    },
    staleTime: 60_000,
  })
}

export async function fetchPrintSettings(): Promise<PrintSettings> {
  const { data } = await apiClient.get<PrintSettings>("/admin/print-settings")
  return data
}

export function useUpdatePrintSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PrintSettingsPayload) => {
      const { data } = await apiClient.patch<PrintSettingsResponse>(
        "/admin/print-settings",
        payload
      )
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.printSettings, data.settings)
    },
  })
}

export function useResetPrintSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<PrintSettingsResponse>(
        "/admin/print-settings/reset",
        {}
      )
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.printSettings, data.settings)
    },
  })
}