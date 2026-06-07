import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import type { ProductSort } from "@/types"
import { ProductCard } from "@/components/common/ProductCard"
import { ProductGridSkeleton } from "./ProductGridSkeleton"
import { useProducts } from "../api"

interface ProductRailProps {
  title: string
  description?: string
  sort: ProductSort
  saleOnly?: boolean
  viewAllHref?: string
}

export function ProductRail({ title, description, sort, saleOnly, viewAllHref }: ProductRailProps) {
  const { data, isLoading } = useProducts({ sort, saleOnly, pageSize: 4, page: 1 })

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
