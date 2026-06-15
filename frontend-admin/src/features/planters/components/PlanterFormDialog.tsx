import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getApiErrorMessage } from "@/lib/api-client"
import type { Planter, PlanterType } from "@/types"
import { planterDefaults, type PlanterFormValues } from "../schema"
import { toPlanterPayload } from "../mapper"
import { useCreatePlanter, useUpdatePlanter } from "../api"
import { PlanterForm } from "./PlanterForm"

interface PlanterFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: PlanterType
  item?: Planter | null
}

function toFormValues(item: Planter): PlanterFormValues {
  return {
    name: item.name,
    material: item.material,
    accessoryBrand: item.accessoryBrand ?? "",
    usageTags: item.usageTags ?? [],
    price: item.price,
    imageUrl: item.imageUrl,
    inStock: item.inStock,
    stockQuantity: item.stockQuantity ?? 0,
    type: item.type,
    sizes: item.sizes ?? [],
  }
}

export function PlanterFormDialog({
  open,
  onOpenChange,
  type,
  item,
}: PlanterFormDialogProps) {
  const createPlanter = useCreatePlanter()
  const updatePlanter = useUpdatePlanter()
  const isEdit = Boolean(item)
  const isAccessory = type === "accessory"
  const noun = isAccessory ? "phụ kiện" : "chậu cây"

  const defaultValues = item ? toFormValues(item) : planterDefaults(type)
  const formKey = item ? String(item.id) : "create"

  const onSubmit = (values: PlanterFormValues) => {
    const payload = toPlanterPayload(values)
    const onSuccess = (res: { message: string }) => {
      toast.success(res.message)
      onOpenChange(false)
    }
    const onError = (err: unknown) => toast.error(getApiErrorMessage(err))

    if (isEdit && item) {
      updatePlanter.mutate({ id: String(item.id), payload }, { onSuccess, onError })
    } else {
      createPlanter.mutate(payload, { onSuccess, onError })
    }
  }

  const isPending = createPlanter.isPending || updatePlanter.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Chỉnh sửa ${noun}` : `Tạo ${noun}`}
          </DialogTitle>
          <DialogDescription>
            {isAccessory
              ? "Phụ kiện chăm sóc cây (bình xịt, dụng cụ...)."
              : "Chậu cây có thể kèm theo sản phẩm."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <PlanterForm
            key={formKey}
            type={type}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={isPending}
            submitLabel={isEdit ? "Lưu" : "Tạo"}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}