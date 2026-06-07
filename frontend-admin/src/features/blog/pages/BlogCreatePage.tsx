import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { getApiErrorMessage } from "@/lib/api-client"
import { BlogForm } from "../components/BlogForm"
import { BLOG_FORM_DEFAULTS, type BlogFormValues } from "../schema"
import { toBlogPayload } from "../mapper"
import { useCreateBlog } from "../api"

export function BlogCreatePage() {
  const navigate = useNavigate()
  const createBlog = useCreateBlog()

  const onSubmit = (values: BlogFormValues) => {
    createBlog.mutate(toBlogPayload(values), {
      onSuccess: (res) => {
        toast.success(res.message)
        navigate("/blog")
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo bài viết"
        description="Soạn thảo bài viết mới hoặc dùng AI để tạo bản nháp."
      />
      <BlogForm
        defaultValues={BLOG_FORM_DEFAULTS}
        onSubmit={onSubmit}
        isSubmitting={createBlog.isPending}
        submitLabel="Đăng bài"
      />
    </div>
  )
}
