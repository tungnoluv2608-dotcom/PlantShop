import type { VietnamProvince, VietnamWard } from "./types"

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function normalizeLocationName(value: string) {
  return stripDiacritics(value.trim().toLowerCase())
    .replace(/^(thanh pho|tinh|tp\.?|tx\.?)\s+/i, "")
    .replace(/\s+/g, " ")
}

export function findProvinceByName(
  provinces: VietnamProvince[],
  name: string,
): VietnamProvince | undefined {
  if (!name) return undefined
  const target = normalizeLocationName(name)
  return provinces.find((p) => {
    const normalized = normalizeLocationName(p.name)
    return (
      normalized === target ||
      normalized.includes(target) ||
      target.includes(normalized)
    )
  })
}

export function findWardByName(wards: VietnamWard[], name: string): VietnamWard | undefined {
  if (!name) return undefined
  const target = normalizeLocationName(name)
  return wards.find((w) => normalizeLocationName(w.name) === target)
}