import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  value: number
  max?: number
  size?: number
  className?: string
}

export function RatingStars({ value, max = 5, size = 16, className }: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value}/${max} sao`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value)
        return (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              filled ? "fill-accent text-accent" : "fill-transparent text-muted-foreground/40",
            )}
          />
        )
      })}
    </div>
  )
}
