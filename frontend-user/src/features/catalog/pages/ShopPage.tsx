import { useMemo } from "react"
import { useSearchParams } from "react-router"
import { SlidersHorizontal, PackageSearch } from "lucide-react"
import type { ProductFilters, ProductSort } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProductCard } from "@/components/common/ProductCard"
import { EmptyState } from "@/components/common/EmptyState"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { ProductGridSkeleton } from "../components/ProductGridSkeleton"
import { ShopFilters, type ShopFilterValues } from "../components/ShopFilters"
import { useAuthStore } from "@/stores/authStore"
import { useWishlistStore } from "@/stores/wishlistStore"
import { useToggleWishlist } from "@/features/wishlist/api"
import { useCategories, useProducts } from "../api"

const PAGE_SIZE = 12
const MAX_PRICE = 2_000_000

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "default", label: "Mặc định" },
  { value: "trending", label: "Thịnh hành" },
  { value: "best-selling", label: "Bán chạy" },
  { value: "sale", label: "Giảm giá" },
  { value: "price-asc", label: "Giá: thấp → cao" },
  { value: "price-desc", label: "Giá: cao → thấp" },
]

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const { data: categories } = useCategories()
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const toggleWishlist = useToggleWishlist()
  const hasWishlist = useWishlistStore((s) => s.has)

  const filters: ProductFilters = useMemo(() => {
    const page = Number(params.get("page") ?? 1)
    return {
      category: params.get("category") ?? undefined,
      search: params.get("search") ?? undefined,
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      sort: (params.get("sort") as ProductSort | null) ?? "default",
      saleOnly: params.get("saleOnly") === "true",
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: PAGE_SIZE,
    }
  }, [params])

  const query = useProducts(filters)
  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const patchParams = (entries: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(params)
    for (const [key, val] of Object.entries(entries)) {
      if (val === undefined || val === "") next.delete(key)
      else next.set(key, val)
    }
    if (resetPage) next.delete("page")
    setParams(next)
  }

  const filterValues: ShopFilterValues = {
    category: filters.category,
    priceRange: [filters.minPrice ?? 0, filters.maxPrice ?? MAX_PRICE],
    saleOnly: Boolean(filters.saleOnly),
  }

  const applyFilters = (next: ShopFilterValues) => {
    patchParams({
      category: next.category,
      minPrice: next.priceRange[0] > 0 ? String(next.priceRange[0]) : undefined,
      maxPrice: next.priceRange[1] < MAX_PRICE ? String(next.priceRange[1]) : undefined,
      saleOnly: next.saleOnly ? "true" : undefined,
    })
  }

  const resetFilters = () => setParams(new URLSearchParams())

  const filtersPanel = categories ? (
    <ShopFilters
      categories={categories}
      maxPrice={MAX_PRICE}
      value={filterValues}
      onChange={applyFilters}
      onReset={resetFilters}
    />
  ) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Cửa hàng</h1>
        {filters.search && (
          <p className="text-muted-foreground">
            Kết quả cho “{filters.search}” · {total} sản phẩm
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">{filtersPanel}</div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="size-4" /> Bộ lọc
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-6">
                <SheetHeader className="px-0">
                  <SheetTitle>Bộ lọc</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{filtersPanel}</div>
              </SheetContent>
            </Sheet>

            <span className="hidden text-sm text-muted-foreground sm:block">
              {total} sản phẩm
            </span>

            <Select
              value={filters.sort}
              onValueChange={(v) => patchParams({ sort: v === "default" ? undefined : v })}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <QueryBoundary
            isLoading={query.isLoading}
            isError={query.isError}
            error={query.error}
            onRetry={query.refetch}
            isEmpty={total === 0}
            loadingFallback={<ProductGridSkeleton count={PAGE_SIZE} />}
            emptyFallback={
              <EmptyState
                icon={PackageSearch}
                title="Không tìm thấy sản phẩm"
                description="Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
              />
            }
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {query.data?.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  enableWishlist={isAuthenticated}
                  isFavorite={hasWishlist(product.id)}
                  onToggleFavorite={
                    isAuthenticated ? (p) => toggleWishlist.mutate(p.id) : undefined
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (filters.page! > 1)
                          patchParams({ page: String(filters.page! - 1) }, false)
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === filters.page}
                          onClick={(e) => {
                            e.preventDefault()
                            patchParams({ page: String(page) }, false)
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (filters.page! < totalPages)
                          patchParams({ page: String(filters.page! + 1) }, false)
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </QueryBoundary>
        </div>
      </div>
    </div>
  )
}
