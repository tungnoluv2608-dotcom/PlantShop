import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { getApiErrorMessage } from "@/lib/api-client"
import { ProductForm } from "../components/ProductForm"
import { PRODUCT_FORM_DEFAULTS, type ProductFormValues } from "../schema"
import { toProductPayload } from "../mapper"
import { useCreateProduct } from "../api"

export function ProductCreatePage() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()

  const onSubmit = (values: ProductFormValues) => {
    createProduct.mutate(toProductPayload(values), {
      onSuccess: (res) => {
        toast.success(res.message)
        navigate("/products")
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo sản phẩm"
        description="Thêm một sản phẩm cây cảnh mới vào cửa hàng."
      />
      <ProductForm
        defaultValues={PRODUCT_FORM_DEFAULTS}
        onSubmit={onSubmit}
        isSubmitting={createProduct.isPending}
        submitLabel="Tạo sản phẩm"
      />
    </div>
  )
}
