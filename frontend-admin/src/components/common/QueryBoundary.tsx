import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/api-client"

interface QueryBoundaryProps {
  isLoading: boolean
  isError: boolean
  error?: unknown
  isEmpty?: boolean
  onRetry?: () => void
  loadingFallback: React.ReactNode
  emptyFallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Standard loading / error / empty wrapper for query-backed views.
 * Keeps every feature page consistent without repeating boilerplate.
 */
export function QueryBoundary({
  isLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  loadingFallback,
  emptyFallback,
  children,
}: QueryBoundaryProps) {
  if (isLoading) return <>{loadingFallback}</>

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Không tải được dữ liệu</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-2">
          <span>{getApiErrorMessage(error)}</span>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Thử lại
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (isEmpty && emptyFallback) return <>{emptyFallback}</>

  return <>{children}</>
}
