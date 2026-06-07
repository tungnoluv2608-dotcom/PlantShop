import type { OrderTimeline as Timeline } from "@/types"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"

export function OrderTimeline({ timeline }: { timeline: Timeline[] }) {
  if (!timeline || timeline.length === 0) return null
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {timeline.map((entry, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              "absolute -left-[1.65rem] top-1 size-3 rounded-full ring-4 ring-background",
              entry.done ? "bg-primary" : "bg-muted-foreground/40",
            )}
          />
          <p className={cn("text-sm font-medium", !entry.done && "text-muted-foreground")}>
            {entry.status}
          </p>
          {entry.date && (
            <p className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</p>
          )}
        </li>
      ))}
    </ol>
  )
}
