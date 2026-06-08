import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import type { VietnamProvince, VietnamProvinceDetail } from "./types"

const BASE_URL = "https://provinces.open-api.vn/api/v2"

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Không tải được dữ liệu địa chỉ (${res.status})`)
  }
  return res.json() as Promise<T>
}

export function fetchVietnamProvinces() {
  return fetchJson<VietnamProvince[]>(`${BASE_URL}/`)
}

export function fetchVietnamProvinceWards(provinceCode: number) {
  return fetchJson<VietnamProvinceDetail>(`${BASE_URL}/p/${provinceCode}?depth=2`)
}

/** Provinces rarely change — cache aggressively. */
const LOCATION_STALE_MS = 1000 * 60 * 60 * 24

export function useVietnamProvinces() {
  return useQuery({
    queryKey: queryKeys.locations.provinces,
    queryFn: fetchVietnamProvinces,
    staleTime: LOCATION_STALE_MS,
  })
}

export function useVietnamWards(provinceCode: number | null) {
  return useQuery({
    queryKey: queryKeys.locations.wards(provinceCode),
    queryFn: () => fetchVietnamProvinceWards(provinceCode!),
    enabled: provinceCode != null,
    staleTime: LOCATION_STALE_MS,
  })
}