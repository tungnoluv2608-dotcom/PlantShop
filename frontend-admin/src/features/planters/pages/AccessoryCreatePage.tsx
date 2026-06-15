import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { getApiErrorMessage } from "@/lib/api-client"
import { PlanterForm } from "../components/PlanterForm"
import { planterDefaults, type PlanterFormValues } from "../schema"
import { toPlanterPayload } from "../mapper"
import { useCreatePlanter } from "../api"

export function AccessoryCreatePage() {
  const navigate = useNavigate()
  const createPlanter = useCreatePlanter()

  const onSubmit = (values: PlanterFormValues) => {
    createPlanter.mutate(toPlanterPayload(values), {
      onSuccess: (res) => {
        toast.success(res.message)
        navigate("/accessories")
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo phụ kiện"
        description="Thêm phụ kiện chăm sóc cây mới (bình xịt, dụng cụ...)."
      />
      <PlanterForm
        type="accessory"
        defaultValues={planterDefaults("accessory")}
        onSubmit={onSubmit}
        isSubmitting={createPlanter.isPending}
        submitLabel="Tạo phụ kiện"
        cancelHref="/accessories"
      />
    </div>
  )
}