import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface FilterChip {
  key: string
  label: string
}

interface ListFilterToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  sort?: string
  sortOptions?: Array<{ value: string; label: string }>
  onSortChange?: (value: string) => void
  sheetTitle?: string
  sheetDescription?: string
  sheetContent: React.ReactNode
  advancedFilterCount?: number
  chips?: FilterChip[]
  onRemoveChip?: (key: string) => void
  onClearAll?: () => void
  hasActiveFilters?: boolean
  /** Optional 1–2 high-frequency filters kept inline (e.g. category). */
  quickFilters?: React.ReactNode
  className?: string
}

/** Compact toolbar: search + optional quick filters + sort + filter sheet. */
export function ListFilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  sort,
  sortOptions,
  onSortChange,
  sheetTitle = "Bộ lọc",
  sheetDescription = "Thay đổi được áp dụng ngay lập tức.",
  sheetContent,
  advancedFilterCount = 0,
  chips = [],
  onRemoveChip,
  onClearAll,
  hasActiveFilters = false,
  quickFilters,
  className,
}: ListFilterToolbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 border-0 bg-muted/50 pl-9 shadow-none focus-visible:ring-1"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {quickFilters}
          {sortOptions && onSortChange && sort !== undefined && (
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger className="h-9 w-[9.5rem] bg-background">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <SlidersHorizontal className="size-4" />
                Bộ lọc
                {advancedFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 rounded-full px-1.5 text-xs"
                  >
                    {advancedFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle>{sheetTitle}</SheetTitle>
                <SheetDescription>{sheetDescription}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
                {sheetContent}
              </div>
              <SheetFooter className="flex-row border-t border-border pt-4">
                {hasActiveFilters && onClearAll && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mr-auto"
                    onClick={onClearAll}
                  >
                    Xóa tất cả
                  </Button>
                )}
                <SheetClose asChild>
                  <Button type="button">Đóng</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {chips.length > 0 && (
        <ActiveFilterChips
          chips={chips}
          onRemoveChip={onRemoveChip}
          onClearAll={onClearAll}
        />
      )}
    </div>
  )
}

interface ActiveFilterChipsProps {
  chips: FilterChip[]
  onRemoveChip?: (key: string) => void
  onClearAll?: () => void
}

function ActiveFilterChips({
  chips,
  onRemoveChip,
  onClearAll,
}: ActiveFilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-0.5">
      <span className="text-xs text-muted-foreground">Đang lọc:</span>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="outline"
          className="gap-1 pr-1 font-normal"
        >
          {chip.label}
          {onRemoveChip && (
            <button
              type="button"
              className="rounded-sm p-0.5 hover:bg-muted"
              onClick={() => onRemoveChip(chip.key)}
              aria-label={`Bỏ lọc ${chip.label}`}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}
      {onClearAll && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-1 text-xs"
          onClick={onClearAll}
        >
          Xóa tất cả
        </Button>
      )}
    </div>
  )
}

/** @deprecated Use ListFilterToolbar instead. */
export function ListFilterBar({
  children,
  chips = [],
  onRemoveChip,
  onClearAll,
  hasActiveFilters = false,
  className,
}: {
  children?: React.ReactNode
  chips?: FilterChip[]
  onRemoveChip?: (key: string) => void
  onClearAll?: () => void
  hasActiveFilters?: boolean
  className?: string
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
      {chips.length > 0 && (
        <ActiveFilterChips
          chips={chips}
          onRemoveChip={onRemoveChip}
          onClearAll={hasActiveFilters ? onClearAll : undefined}
        />
      )}
    </div>
  )
}

interface FilterFieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FilterSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function FilterSearchInput({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className,
}: FilterSearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}

/** Min width for toolbar quick-filters — fits labels like "Tất cả thanh toán". */
export const TOOLBAR_FILTER_SELECT_CLASS =
  "h-9 min-w-48 w-auto max-w-56 shrink-0 [&_[data-slot=select-value]]:line-clamp-none"

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: Array<{ value: string; label: string }>
  className?: string
  /** `toolbar` = inline quick filter on ListFilterToolbar (wider, no text clamp). */
  variant?: "default" | "toolbar"
}

export function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
  variant = "default",
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          variant === "toolbar" ? TOOLBAR_FILTER_SELECT_CLASS : "w-full",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface FilterDateRangeProps {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  className?: string
  stacked?: boolean
}

export function FilterDateRange({
  from,
  to,
  onFromChange,
  onToChange,
  className,
  stacked = false,
}: FilterDateRangeProps) {
  if (stacked) {
    return (
      <div className={cn("grid gap-3", className)}>
        <FilterField label="Từ ngày">
          <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
        </FilterField>
        <FilterField label="Đến ngày">
          <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
        </FilterField>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-end gap-2", className)}>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Từ ngày</Label>
        <Input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="w-36"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Đến ngày</Label>
        <Input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="w-36"
        />
      </div>
    </div>
  )
}

interface FilterNumberRangeProps {
  min: string
  max: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  minLabel?: string
  maxLabel?: string
  className?: string
  stacked?: boolean
}

export function FilterNumberRange({
  min,
  max,
  onMinChange,
  onMaxChange,
  minLabel = "Tối thiểu",
  maxLabel = "Tối đa",
  className,
  stacked = false,
}: FilterNumberRangeProps) {
  if (stacked) {
    return (
      <div className={cn("grid gap-3", className)}>
        <FilterField label={minLabel}>
          <Input
            type="number"
            min={0}
            value={min}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder="0"
          />
        </FilterField>
        <FilterField label={maxLabel}>
          <Input
            type="number"
            min={0}
            value={max}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder="Không giới hạn"
          />
        </FilterField>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-end gap-2", className)}>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{minLabel}</Label>
        <Input
          type="number"
          min={0}
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-28"
          placeholder="0"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{maxLabel}</Label>
        <Input
          type="number"
          min={0}
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-28"
          placeholder="∞"
        />
      </div>
    </div>
  )
}

export interface StatusTabOption<T extends string = string> {
  value: T
  label: string
}

interface StatusFilterTabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: StatusTabOption<T>[]
  counts?: Partial<Record<T, number>>
}

export function StatusFilterTabs<T extends string>({
  value,
  onChange,
  options,
  counts,
}: StatusFilterTabsProps<T>) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
      <div className="overflow-x-auto pb-0.5">
        <TabsList className="inline-flex h-auto w-max min-w-0 flex-nowrap justify-start">
          {options.map((option) => {
            const count = counts?.[option.value]
            return (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="shrink-0 gap-1.5 px-3"
              >
                {option.label}
                {typeof count === "number" && count > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 rounded-full px-1.5 text-xs"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>
    </Tabs>
  )
}

/** Builds removable chip labels from active filter values. */
export function buildFilterChips(
  entries: Array<{
    key: string
    value: string
    defaultValue: string
    label: string
    formatValue?: (value: string) => string
  }>
): FilterChip[] {
  return entries
    .filter(({ value, defaultValue }) => value !== defaultValue && value !== "")
    .map(({ key, value, label, formatValue }) => ({
      key,
      label: `${label}: ${formatValue ? formatValue(value) : value}`,
    }))
}

/** Counts active filters, optionally excluding toolbar keys (q, sort). */
export function countAdvancedFilters<T extends Record<string, string>>(
  values: T,
  defaults: T,
  exclude: Array<keyof T & string> = ["q", "sort"]
): number {
  return (Object.keys(defaults) as Array<keyof T & string>).filter((key) => {
    if (exclude.includes(key)) return false
    const value = values[key]
    const defaultValue = defaults[key]
    return value !== defaultValue && value !== ""
  }).length
}