import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { TagInput } from "@/components/common/TagInput"
import { SingleImageUploader } from "@/components/common/ImageUploader"
import { getApiErrorMessage } from "@/lib/api-client"
import type { Planter, PlanterPayload, PlanterType } from "@/types"
import { planterSchema, planterDefaults, type PlanterFormValues } from "../schema"
import { useCreatePlanter, useUpdatePlanter } from "../api"

interface PlanterFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: PlanterType
  item?: Planter | null
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

  const form = useForm<PlanterFormValues>({
    resolver: zodResolver(planterSchema),
    defaultValues: planterDefaults(type),
  })

  useEffect(() => {
    if (open) {
      form.reset(
        item
          ? {
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
          : planterDefaults(type)
      )
    }
  }, [open, item, type, form])

  const onSubmit = (values: PlanterFormValues) => {
    const payload: PlanterPayload = {
      name: values.name,
      material: values.material,
      accessoryBrand: isAccessory ? values.accessoryBrand : "",
      usageTags: isAccessory ? values.usageTags : [],
      price: values.price,
      imageUrl: values.imageUrl,
      inStock: values.inStock,
      stockQuantity: values.stockQuantity,
      type: values.type,
      sizes: isAccessory ? [] : values.sizes,
    }
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
  const noun = isAccessory ? "phụ kiện" : "chậu cây"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh</FormLabel>
                  <FormControl>
                    <SingleImageUploader value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isAccessory ? "vd: Bình xịt tưới" : "vd: Chậu gốm trắng"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isAccessory ? "Loại dụng cụ" : "Chất liệu"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isAccessory ? "vd: Dụng cụ chăm cây" : "vd: Gốm"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá (₫)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAccessory ? (
              <>
                <FormField
                  control={form.control}
                  name="accessoryBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thương hiệu</FormLabel>
                      <FormControl>
                        <Input placeholder="vd: Gardena" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usageTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Công dụng</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="vd: Tưới cây, Chăm sóc lá..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <FormField
                control={form.control}
                name="sizes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kích thước</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="vd: S, M, L..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng tồn kho</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => {
                        const next = Math.max(0, e.target.valueAsNumber || 0)
                        field.onChange(next)
                        form.setValue("inStock", next > 0, { shouldDirty: true })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inStock"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <FormLabel className="mb-0">Còn hàng</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (!checked) {
                          form.setValue("stockQuantity", 0, { shouldDirty: true })
                        } else if (form.getValues("stockQuantity") <= 0) {
                          form.setValue("stockQuantity", 1, { shouldDirty: true })
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Lưu" : "Tạo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
