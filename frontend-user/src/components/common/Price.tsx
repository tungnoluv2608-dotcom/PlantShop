import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"

interface PriceProps {
  value: number
  originalValue?: number | null
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
} as const

export function Price({ value, originalValue, className, size = "md" }: PriceProps) {
  const hasDiscount = typeof originalValue === "number" && originalValue > value
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-foreground", sizeMap[size])}>
        {formatVND(value)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          {formatVND(originalValue)}
        </span>
      )}
    </div>
  )
}
