import { Package } from "lucide-react"
import type { PlanterType } from "@/types"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { EmptyState } from "@/components/common/EmptyState"
import { ProductGridSkeleton } from "@/features/catalog/components/ProductGridSkeleton"
import { usePlanters } from "../api"
import { PlanterCard } from "./PlanterCard"

interface PlanterListViewProps {
  type: PlanterType
  title: string
  description: string
}

export function PlanterListView({ type, title, description }: PlanterListViewProps) {
  const query = usePlanters(type)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>

      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(query.data?.length ?? 0) === 0}
        loadingFallback={<ProductGridSkeleton count={8} />}
        emptyFallback={<EmptyState icon={Package} title="Chưa có sản phẩm" />}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {query.data?.map((planter) => (
            <PlanterCard key={planter.id} planter={planter} />
          ))}
        </div>
      </QueryBoundary>
    </div>
  )
}
