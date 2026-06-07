import { Link } from "react-router"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories } from "../api"

export function CategoryShowcase() {
  const { data, isLoading } = useCategories()

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">Danh mục nổi bật</h2>
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
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
            >
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-medium text-white">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
