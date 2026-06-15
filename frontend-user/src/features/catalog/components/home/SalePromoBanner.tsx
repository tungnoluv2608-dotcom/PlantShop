import { Link } from "react-router"
import { ArrowRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Price } from "@/components/common/Price"
import { useProducts } from "../../api"

export function SalePromoBanner() {
  const { data, isLoading } = useProducts({ sort: "sale", saleOnly: true, pageSize: 1, page: 1 })
  const product = data?.products[0]

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </section>
    )
  }

  if (!product) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-4">
      <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/15 via-card to-primary/10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="grid items-center gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8 lg:grid-cols-[280px_1fr_auto] lg:gap-10">
          <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl shadow-lg lg:max-w-none">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="size-full object-cover"
            />
            {product.discount && (
              <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                -{product.discount}
              </span>
            )}
          </div>

          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
              <Flame className="size-4" />
              Ưu đãi nổi bật tuần này
            </span>
            <h3 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">{product.title}</h3>
            <p className="mt-2 line-clamp-2 text-muted-foreground">{product.description}</p>
            <div className="mt-4 flex justify-center md:justify-start">
              <Price value={product.price} originalValue={product.originalPrice} size="lg" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 md:items-end">
            <Button asChild size="lg" className="w-full min-w-[160px] md:w-auto">
              <Link to={`/product/${product.id}`}>
                Mua ngay <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/shop?saleOnly=true">Xem tất cả khuyến mãi</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}