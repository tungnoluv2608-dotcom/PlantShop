import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories } from "../api"

export function CategoryShowcase() {
  const { data, isLoading } = useCategories()

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">Danh mục nổi bật</h2>
          <p className="mt-1 text-muted-foreground">
            Khám phá bộ sưu tập cây cảnh theo từng loại
          </p>
        </div>
        <Link
          to="/shop"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          Tất cả danh mục <ArrowRight className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data?.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity group-hover:from-black/80" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-medium text-white">{category.name}</h3>
                {category.subcategories.length > 0 && (
                  <p className="mt-0.5 text-xs text-white/70">
                    {category.subcategories.slice(0, 2).join(" · ")}
                  </p>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                  Khám phá <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}