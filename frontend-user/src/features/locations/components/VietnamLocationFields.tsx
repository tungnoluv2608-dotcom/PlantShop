import { useEffect, useMemo, useState } from "react"
import type { Control, FieldPath, FieldValues, UseFormSetValue } from "react-hook-form"
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
import { useVietnamProvinces, useVietnamWards } from "../api"
import { findProvinceByName } from "../utils"

interface VietnamLocationFieldsProps<T extends FieldValues> {
  control: Control<T>
  setValue: UseFormSetValue<T>
  provinceName: FieldPath<T>
  wardName: FieldPath<T>
  /** Legacy district — preserved when editing old addresses. */
  districtName?: FieldPath<T>
  initialProvince?: string
}

export function VietnamLocationFields<T extends FieldValues>({
  control,
  setValue,
  provinceName,
  wardName,
  districtName,
  initialProvince = "",
}: VietnamLocationFieldsProps<T>) {
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

  // Resolve province code when provinces load or when editing an existing address.
  useEffect(() => {
    if (!provinces.length || !initialProvince) return
    const match = findProvinceByName(provinces, initialProvince)
    if (match) setProvinceCode(match.code)
  }, [provinces, initialProvince])

  const handleProvinceChange = (code: string, onChange: (value: string) => void) => {
    const selected = provinces.find((p) => String(p.code) === code)
    if (!selected) return
    setProvinceCode(selected.code)
    onChange(selected.name)
    setValue(wardName, "" as never)
    if (districtName) setValue(districtName, "" as never)
  }

  return (
    <>
      <FormField
        control={control}
        name={provinceName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tỉnh / Thành phố</FormLabel>
            {provincesQuery.isLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : provincesQuery.isError ? (
              <p className="text-sm text-destructive">Không tải được danh sách tỉnh/thành.</p>
            ) : (
              <Select
                value={provinceCode != null ? String(provinceCode) : ""}
                onValueChange={(code) => handleProvinceChange(code, field.onChange)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tỉnh / thành phố" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
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
        name={wardName}
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
                value={
                  wardOptions.find((w) => w.name === field.value)
                    ? String(wardOptions.find((w) => w.name === field.value)!.code)
                    : ""
                }
                onValueChange={(code) => {
                  const selected = wardOptions.find((w) => String(w.code) === code)
                  if (selected) field.onChange(selected.name)
                }}
                disabled={!provinceCode}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn phường / xã" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-72">
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
    </>
  )
}