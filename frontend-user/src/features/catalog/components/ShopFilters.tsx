import { useState } from "react"
import type { Category } from "@/types"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface ShopFilterValues {
  category?: string
  priceRange: [number, number]
  saleOnly: boolean
}

interface ShopFiltersProps {
  categories: Category[]
  maxPrice: number
  value: ShopFilterValues
  onChange: (next: ShopFilterValues) => void
  onReset: () => void
}

export function ShopFilters({ categories, maxPrice, value, onChange, onReset }: ShopFiltersProps) {
  const [range, setRange] = useState<[number, number]>(value.priceRange)

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Danh mục
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onChange({ ...value, category: undefined })}
            className={cn(
              "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
              !value.category && "bg-primary/10 font-medium text-primary",
            )}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ ...value, category: c.name })}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                value.category === c.name && "bg-primary/10 font-medium text-primary",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Khoảng giá
        </h3>
        <Slider
          min={0}
          max={maxPrice}
          step={50000}
          value={range}
          onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
          onValueCommit={(v) =>
            onChange({ ...value, priceRange: [v[0], v[1]] as [number, number] })
          }
        />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>{formatVND(range[0])}</span>
          <span>{formatVND(range[1])}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="saleOnly"
          checked={value.saleOnly}
          onCheckedChange={(checked) => onChange({ ...value, saleOnly: Boolean(checked) })}
        />
        <Label htmlFor="saleOnly" className="cursor-pointer">
          Chỉ hàng giảm giá
        </Label>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={onReset}>
        Xóa bộ lọc
      </Button>
    </aside>
  )
}
