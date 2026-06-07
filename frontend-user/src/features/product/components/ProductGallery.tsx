import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : []
  const [active, setActive] = useState(0)
  const current = gallery[active] ?? gallery[0]

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
        <img
          src={current}
          alt={title}
          className="size-full object-cover"
          width={720}
          height={720}
        />
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border bg-muted transition-all",
                i === active ? "border-primary ring-2 ring-primary/30" : "border-border",
              )}
            >
              <img src={img} alt={`${title} ${i + 1}`} loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
