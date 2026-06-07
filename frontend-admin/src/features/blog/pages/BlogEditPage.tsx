import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-client"
import { BlogForm } from "../components/BlogForm"
import { type BlogFormValues } from "../schema"
import { toBlogPayload, toBlogFormValues } from "../mapper"
import { useBlogPost, useUpdateBlog } from "../api"

export function BlogEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const postQuery = useBlogPost(id)
  const updateBlog = useUpdateBlog()

  const onSubmit = (values: BlogFormValues) => {
    if (!id) return
    updateBlog.mutate(
      { id, payload: toBlogPayload(values) },
      {
        onSuccess: (res) => {
          toast.success(res.message)
          navigate("/blog")
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Chỉnh sửa bài viết" description={postQuery.data?.title} />
      <QueryBoundary
        isLoading={postQuery.isLoading}
        isError={postQuery.isError}
        error={postQuery.error}
        onRetry={() => postQuery.refetch()}
        loadingFallback={
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        }
      >
        {postQuery.data && (
          <BlogForm
            defaultValues={toBlogFormValues(postQuery.data)}
            onSubmit={onSubmit}
            isSubmitting={updateBlog.isPending}
            submitLabel="Lưu thay đổi"
          />
        )}
      </QueryBoundary>
    </div>
  )
}
