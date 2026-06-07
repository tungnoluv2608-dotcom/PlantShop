import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { ShippingAddress } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/lib/api-client"
import { addressSchema, type AddressFormValues } from "../schema"
import { useCreateAddress, useUpdateAddress } from "../api"

interface AddressFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: ShippingAddress | null
}

const EMPTY: AddressFormValues = {
  label: "",
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  address: "",
  isDefault: false,
}

export function AddressFormDialog({ open, onOpenChange, editing }: AddressFormDialogProps) {
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              label: editing.label,
              fullName: editing.fullName,
              phone: editing.phone,
              province: editing.province,
              district: editing.district,
              ward: editing.ward ?? "",
              address: editing.address,
              isDefault: editing.isDefault,
            }
          : EMPTY,
      )
    }
  }, [open, editing, form])

  const onSubmit = async (values: AddressFormValues) => {
    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing.id, payload: values })
        toast.success("Đã cập nhật địa chỉ")
      } else {
        await createAddress.mutateAsync(values)
        toast.success("Đã thêm địa chỉ")
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const fields: { name: keyof AddressFormValues; label: string; placeholder?: string }[] = [
    { name: "label", label: "Nhãn", placeholder: "Nhà riêng / Công ty" },
    { name: "fullName", label: "Họ tên người nhận" },
    { name: "phone", label: "Số điện thoại" },
    { name: "province", label: "Tỉnh / Thành phố" },
    { name: "district", label: "Quận / Huyện" },
    { name: "ward", label: "Phường / Xã" },
    { name: "address", label: "Địa chỉ chi tiết", placeholder: "Số nhà, tên đường" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Sửa địa chỉ" : "Thêm địa chỉ"}</DialogTitle>
          <DialogDescription>Địa chỉ giao hàng của bạn.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={f.placeholder} {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label className="cursor-pointer">Đặt làm địa chỉ mặc định</Label>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {editing ? "Lưu thay đổi" : "Thêm địa chỉ"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
