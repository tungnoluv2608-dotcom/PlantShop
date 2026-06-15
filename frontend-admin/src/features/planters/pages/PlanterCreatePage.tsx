import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { getApiErrorMessage } from "@/lib/api-client"
import { PlanterForm } from "../components/PlanterForm"
import { planterDefaults, type PlanterFormValues } from "../schema"
import { toPlanterPayload } from "../mapper"
import { useCreatePlanter } from "../api"

export function PlanterCreatePage() {
  const navigate = useNavigate()
  const createPlanter = useCreatePlanter()

  const onSubmit = (values: PlanterFormValues) => {
    createPlanter.mutate(toPlanterPayload(values), {
      onSuccess: (res) => {
        toast.success(res.message)
        navigate("/planters")
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo chậu cây"
        description="Thêm chậu cây mới có thể kèm theo sản phẩm."
      />
      <PlanterForm
        type="planter"
        defaultValues={planterDefaults("planter")}
        onSubmit={onSubmit}
        isSubmitting={createPlanter.isPending}
        submitLabel="Tạo chậu cây"
        cancelHref="/planters"
      />
    </div>
  )
}