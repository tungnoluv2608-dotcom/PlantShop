import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-client"
import { useCategories } from "@/features/categories/api"
import { ProductForm } from "../components/ProductForm"
import { type ProductFormValues } from "../schema"
import { toProductPayload, toProductFormValues } from "../mapper"
import { useProductDetail, useUpdateProduct } from "../api"

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const productQuery = useProductDetail(id)
  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data
  const updateProduct = useUpdateProduct()

  const onSubmit = (values: ProductFormValues) => {
    if (!id) return
    updateProduct.mutate(
      { id, payload: toProductPayload(values) },
      {
        onSuccess: (res) => {
          toast.success(res.message)
          navigate("/products")
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  }

  const product = productQuery.data
  const categoryId =
    categories?.find((c) => c.name === product?.category)?.id ?? ""

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa sản phẩm"
        description={product?.title}
      />
      <QueryBoundary
        isLoading={productQuery.isLoading || categoriesQuery.isLoading}
        isError={productQuery.isError}
        error={productQuery.error}
        onRetry={() => productQuery.refetch()}
        loadingFallback={
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        }
      >
        {product && (
          <ProductForm
            defaultValues={toProductFormValues(product, String(categoryId))}
            onSubmit={onSubmit}
            isSubmitting={updateProduct.isPending}
            submitLabel="Lưu thay đổi"
          />
        )}
      </QueryBoundary>
    </div>
  )
}
