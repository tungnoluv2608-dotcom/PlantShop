import { useEffect, useMemo, useState } from "react"
import type { Control, UseFormSetValue } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { ShippingZoneFormValues } from "@/features/shipping-zones/schema"
import { useVietnamProvinces, useVietnamWards } from "../api"
import { findProvinceByName } from "../utils"

const NONE = "__none__"

interface ShippingZoneLocationFieldsProps {
  control: Control<ShippingZoneFormValues>
  setValue: UseFormSetValue<ShippingZoneFormValues>
  initialProvince?: string
}

export function ShippingZoneLocationFields({
  control,
  setValue,
  initialProvince = "",
}: ShippingZoneLocationFieldsProps) {
  const provincesQuery = useVietnamProvinces()
  const provinces = provincesQuery.data ?? []

  const [provinceCode, setProvinceCode] = useState<number | null>(null)
  const wardsQuery = useVietnamWards(provinceCode)
  const wards = wardsQuery.data?.wards ?? []

  const provinceOptions = useMemo(
    () => [...provinces].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [provinces],
  )

  const wardOptions = useMemo(
    () => [...wards].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [wards],
  )

  useEffect(() => {
    if (!initialProvince) {
      setProvinceCode(null)
      return
    }
    if (!provinces.length) return
    const match = findProvinceByName(provinces, initialProvince)
    if (match) setProvinceCode(match.code)
  }, [provinces, initialProvince])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="province"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tỉnh / Thành phố</FormLabel>
            {provincesQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : provincesQuery.isError ? (
              <p className="text-sm text-destructive">Không tải được danh sách tỉnh/thành.</p>
            ) : (
              <Select
                value={provinceCode != null ? String(provinceCode) : NONE}
                onValueChange={(code) => {
                  if (code === NONE) {
                    setProvinceCode(null)
                    field.onChange("")
                    setValue("district", "")
                    return
                  }
                  const selected = provinces.find((p) => String(p.code) === code)
                  if (!selected) return
                  setProvinceCode(selected.code)
                  field.onChange(selected.name)
                  setValue("district", "")
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toàn quốc (mặc định)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  <SelectItem value={NONE}>Toàn quốc (mặc định)</SelectItem>
                  {provinceOptions.map((p) => (
                    <SelectItem key={p.code} value={String(p.code)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="district"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phường / Xã</FormLabel>
            {!provinceCode ? (
              <Select disabled>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tỉnh/thành trước" />
                  </SelectTrigger>
                </FormControl>
              </Select>
            ) : wardsQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : wardsQuery.isError ? (
              <p className="text-sm text-destructive">Không tải được danh sách phường/xã.</p>
            ) : (
              <Select
                value={(() => {
                  if (!field.value) return NONE
                  const matched = wardOptions.find((w) => w.name === field.value)
                  if (matched) return String(matched.code)
                  return "__legacy__"
                })()}
                onValueChange={(code) => {
                  if (code === NONE) {
                    field.onChange("")
                    return
                  }
                  if (code === "__legacy__") return
                  const selected = wardOptions.find((w) => String(w.code) === code)
                  if (selected) field.onChange(selected.name)
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toàn tỉnh/thành" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
                  <SelectItem value={NONE}>Toàn tỉnh/thành</SelectItem>
                  {field.value &&
                    !wardOptions.some((w) => w.name === field.value) && (
                      <SelectItem value="__legacy__">{field.value} (quận/huyện cũ)</SelectItem>
                    )}
                  {wardOptions.map((w) => (
                    <SelectItem key={w.code} value={String(w.code)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}