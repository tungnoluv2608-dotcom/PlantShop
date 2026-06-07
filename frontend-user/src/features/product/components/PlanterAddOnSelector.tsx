import type { Planter } from "@/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PlanterAddOnSelectorProps {
  options: Planter[]
  isLoading: boolean
  /** Selected planter id, or "none". */
  value: string
  onChange: (planterId: string) => void
}

export function PlanterAddOnSelector({
  options,
  isLoading,
  value,
  onChange,
}: PlanterAddOnSelectorProps) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />
  }
  if (options.length === 0) return null

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Kèm chậu trồng (tùy chọn)</Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid gap-2 sm:grid-cols-2">
        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
            value === "none" ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <RadioGroupItem value="none" />
          <span>Không kèm chậu</span>
        </label>
        {options.map((planter) => (
          <label
            key={planter.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
              value === planter.id ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <RadioGroupItem value={planter.id} />
            <img
              src={planter.imageUrl}
              alt={planter.name}
              className="size-10 rounded object-cover"
            />
            <span className="flex-1">
              <span className="block">{planter.name}</span>
              <span className="text-accent">+{formatVND(planter.price)}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
