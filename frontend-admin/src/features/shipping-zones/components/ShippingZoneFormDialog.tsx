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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api-client"
import { VIETNAM_PROVINCES, getDistricts } from "@/data/vietnamLocations"
import type { ShippingZone, ShippingZonePayload } from "@/types"
import { shippingZoneSchema, type ShippingZoneFormValues } from "../schema"
import { useCreateShippingZone, useUpdateShippingZone } from "../api"

interface ShippingZoneFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  zone?: ShippingZone | null
}

const EMPTY: ShippingZoneFormValues = {
  name: "",
  province: "",
  district: "",
  standardFee: 35000,
  expressFee: 45000,
  samedayFee: 60000,
  allowsSameday: false,
  freeShippingThreshold: 500000,
  priority: 0,
  isActive: true,
}

function toPayload(values: ShippingZoneFormValues): ShippingZonePayload {
  return {
    name: values.name.trim(),
    province: values.province.trim() ? values.province.trim() : null,
    district: values.district.trim() ? values.district.trim() : null,
    standardFee: values.standardFee,
    expressFee: values.expressFee,
    samedayFee: values.samedayFee,
    allowsSameday: values.allowsSameday,
    freeShippingThreshold:
      values.freeShippingThreshold === "" ? null : Number(values.freeShippingThreshold),
    priority: values.priority,
    isActive: values.isActive,
  }
}

export function ShippingZoneFormDialog({
  open,
  onOpenChange,
  zone,
}: ShippingZoneFormDialogProps) {
  const createZone = useCreateShippingZone()
  const updateZone = useUpdateShippingZone()
  const isEdit = Boolean(zone)

  const form = useForm<ShippingZoneFormValues>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: EMPTY,
  })

  const selectedProvince = form.watch("province")
  const districts = selectedProvince ? getDistricts(selectedProvince) : []

  useEffect(() => {
    if (!open) return
    if (zone) {
      form.reset({
        name: zone.name,
        province: zone.province ?? "",
        district: zone.district ?? "",
        standardFee: zone.standardFee,
        expressFee: zone.expressFee,
        samedayFee: zone.samedayFee,
        allowsSameday: zone.allowsSameday,
        freeShippingThreshold: zone.freeShippingThreshold ?? "",
        priority: zone.priority,
        isActive: zone.isActive,
      })
      return
    }
    form.reset(EMPTY)
  }, [open, zone, form])

  const onSubmit = (values: ShippingZoneFormValues) => {
    const payload = toPayload(values)
    const mutation = isEdit
      ? updateZone.mutateAsync({ id: String(zone!.id), payload })
      : createZone.mutateAsync(payload)

    mutation
      .then((res) => {
        toast.success(res.message)
        onOpenChange(false)
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
  }

  const pending = createZone.isPending || updateZone.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa vùng vận chuyển" : "Thêm vùng vận chuyển"}</DialogTitle>
          <DialogDescription>
            Ưu tiên cao hơn sẽ được áp dụng trước. Để trống tỉnh/thành = vùng mặc định toàn quốc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên vùng</FormLabel>
                  <FormControl>
                    <Input placeholder="vd: Nội thành TP.HCM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/thành</FormLabel>
                    <Select
                      value={field.value || "__none__"}
                      onValueChange={(value) => {
                        const next = value === "__none__" ? "" : value
                        field.onChange(next)
                        form.setValue("district", "")
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Toàn quốc (mặc định)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Toàn quốc (mặc định)</SelectItem>
                        {VIETNAM_PROVINCES.map((province) => (
                          <SelectItem key={province.name} value={province.name}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quận/huyện</FormLabel>
                    <Select
                      value={field.value || "__none__"}
                      onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                      disabled={!selectedProvince}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Toàn tỉnh/thành" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Toàn tỉnh/thành</SelectItem>
                        {districts.map((district) => (
                          <SelectItem key={district.name} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="standardFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí tiêu chuẩn</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expressFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí nhanh</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="samedayFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí trong ngày</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="freeShippingThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngưỡng miễn phí (tiêu chuẩn)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={10000}
                        placeholder="Để trống = dùng mặc định hệ thống"
                        value={field.value}
                        onChange={(e) => {
                          const raw = e.target.value
                          field.onChange(raw === "" ? "" : Number(raw))
                        }}
                      />
                    </FormControl>
                    <FormDescription>Áp dụng cho giao tiêu chuẩn.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ưu tiên</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={1}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Số cao hơn = ưu tiên hơn.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="allowsSameday"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Cho phép giao trong ngày</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Đang kích hoạt</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Lưu thay đổi" : "Tạo vùng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}