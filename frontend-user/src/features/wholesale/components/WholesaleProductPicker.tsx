import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useProductSearch } from "@/features/catalog/api"
import type { WholesaleInterestItem } from "../schema"

interface WholesaleProductPickerProps {
  value: WholesaleInterestItem[]
  onChange: (next: WholesaleInterestItem[]) => void
}

export function WholesaleProductPicker({ value, onChange }: WholesaleProductPickerProps) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 300)
  const searchQuery = useProductSearch(debouncedQuery)

  const selectedIds = useMemo(() => new Set(value.map((item) => item.id)), [value])

  const toggleProduct = (item: { id: string; title: string }) => {
    if (selectedIds.has(item.id)) {
      onChange(value.filter((entry) => entry.id !== item.id))
      return
    }
    if (value.length >= 20) return
    onChange([...value, { id: item.id, title: item.title, name: item.title }])
  }

  const removeProduct = (id: string) => {
    onChange(value.filter((entry) => entry.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm quan tâm (tối thiểu 2 ký tự)..."
          className="pl-9"
        />
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1 pr-1">
              {item.title || item.name}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5"
                onClick={() => removeProduct(item.id)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {debouncedQuery.trim().length >= 2 && (
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
          {searchQuery.isLoading && (
            <p className="px-2 py-3 text-sm text-muted-foreground">Đang tìm...</p>
          )}
          {!searchQuery.isLoading && (searchQuery.data?.length ?? 0) === 0 && (
            <p className="px-2 py-3 text-sm text-muted-foreground">Không tìm thấy sản phẩm.</p>
          )}
          {searchQuery.data?.map((product) => (
            <label
              key={product.id}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60"
            >
              <Checkbox
                checked={selectedIds.has(product.id)}
                onCheckedChange={() => toggleProduct(product)}
              />
              <span className="min-w-0 flex-1 truncate text-sm">{product.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}