import { Link } from "react-router"
import { History, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/format"
import { useAdvisorHistory } from "../api"
import { RecommendationCard } from "../components/RecommendationCard"

export function AdvisorHistoryPage() {
  const query = useAdvisorHistory()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-semibold">
          <History className="size-7" /> Lịch sử tư vấn
        </h1>
        <Button asChild variant="outline">
          <Link to="/advisor">
            <Sparkles className="size-4" /> Tư vấn mới
          </Link>
        </Button>
      </div>

      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={query.refetch}
        isEmpty={(query.data?.length ?? 0) === 0}
        loadingFallback={
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        }
        emptyFallback={
          <EmptyState
            icon={History}
            title="Chưa có lịch sử tư vấn"
            description="Các phiên tư vấn AI của bạn sẽ hiển thị ở đây."
            action={
              <Button asChild>
                <Link to="/advisor">Bắt đầu tư vấn</Link>
              </Button>
            }
          />
        }
      >
        <div className="space-y-6">
          {query.data?.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="text-base font-medium text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                </CardTitle>
                <p className="text-sm">{entry.summary}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {entry.recommendations.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  )
}
