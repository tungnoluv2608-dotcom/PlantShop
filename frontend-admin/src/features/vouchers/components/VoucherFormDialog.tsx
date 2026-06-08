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
import { Textarea } from "@/components/ui/textarea"
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
import type { Voucher, VoucherPayload } from "@/types"
import { useCategories } from "@/features/categories/api"
import { useAdminProducts } from "@/features/products/api"
import { voucherSchema, toDatetimeLocalValue, type VoucherFormValues } from "../schema"
import { useCreateVoucher, useUpdateVoucher } from "../api"

interface VoucherFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher?: Voucher | null
}

function toPayload(values: VoucherFormValues): VoucherPayload {
  const scopeType = values.appliesTo === "category" ? "category" : "product"
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: values.description?.trim() || null,
    discountType: values.discountType,
    discountValue: values.discountType === "freeship" ? 0 : values.discountValue,
    maxDiscount: values.maxDiscount === "" || values.maxDiscount == null ? null : Number(values.maxDiscount),
    minOrderValue: values.minOrderValue,
    usageLimit: values.usageLimit === "" || values.usageLimit == null ? null : Number(values.usageLimit),
    usagePerUser: values.usagePerUser,
    startsAt: new Date(values.startsAt).toISOString(),
    expiresAt: new Date(values.expiresAt).toISOString(),
    isActive: values.isActive,
    appliesTo: values.appliesTo,
    scopes:
      values.appliesTo === "all"
        ? []
        : values.scopeIds.map((id) => ({
            scopeType,
            scopeId: Number(id),
          })),
  }
}

export function VoucherFormDialog({ open, onOpenChange, voucher }: VoucherFormDialogProps) {
  const createVoucher = useCreateVoucher()
  const updateVoucher = useUpdateVoucher()
  const { data: categories } = useCategories()
  const { data: products } = useAdminProducts()
  const isEdit = Boolean(voucher)

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      discountType: "percent",
      discountValue: 10,
      maxDiscount: "",
      minOrderValue: 0,
      usageLimit: "",
      usagePerUser: 1,
      startsAt: "",
      expiresAt: "",
      isActive: true,
      appliesTo: "all",
      scopeIds: [],
    },
  })

  const discountType = form.watch("discountType")
  const appliesTo = form.watch("appliesTo")

  useEffect(() => {
    if (!open) return
    form.reset({
      code: voucher?.code ?? "",
      name: voucher?.name ?? "",
      description: voucher?.description ?? "",
      discountType: voucher?.discountType ?? "percent",
      discountValue: voucher?.discountValue ?? 10,
      maxDiscount: voucher?.maxDiscount ?? "",
      minOrderValue: voucher?.minOrderValue ?? 0,
      usageLimit: voucher?.usageLimit ?? "",
      usagePerUser: voucher?.usagePerUser ?? 1,
      startsAt: toDatetimeLocalValue(voucher?.startsAt) || toDatetimeLocalValue(new Date().toISOString()),
      expiresAt: toDatetimeLocalValue(voucher?.expiresAt),
      isActive: voucher?.isActive ?? true,
      appliesTo: voucher?.appliesTo ?? "all",
      scopeIds: voucher?.scopes?.map((s) => String(s.scopeId)) ?? [],
    })
  }, [open, voucher, form])

  const onSubmit = (values: VoucherFormValues) => {
    const payload = toPayload(values)
    const onSuccess = (res: { message: string }) => {
      toast.success(res.message)
      onOpenChange(false)
    }
    const onError = (err: unknown) => toast.error(getApiErrorMessage(err))

    if (isEdit && voucher) {
      updateVoucher.mutate({ id: String(voucher.id), payload }, { onSuccess, onError })
      return
    }
    createVoucher.mutate(payload, { onSuccess, onError })
  }

  const isPending = createVoucher.isPending || updateVoucher.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa voucher" : "Tạo voucher mới"}</DialogTitle>
          <DialogDescription>
            Cấu hình mã giảm giá, điều kiện áp dụng và thời hạn hiệu lực.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã voucher</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PLANT10" onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                    <FormLabel>Tên hiển thị</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Giảm 10% toàn sàn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Điều kiện áp dụng cho khách hàng" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại giảm</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percent">Phần trăm (%)</SelectItem>
                        <SelectItem value="fixed">Số tiền cố định</SelectItem>
                        <SelectItem value="freeship">Miễn phí vận chuyển</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {discountType !== "freeship" && (
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{discountType === "percent" ? "Phần trăm" : "Số tiền giảm (đ)"}</FormLabel>
                      <FormControl>
                        <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {discountType === "percent" && (
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giảm tối đa (đ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Không giới hạn"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không giới hạn mức giảm.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="minOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn tối thiểu (đ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng lượt dùng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Không giới hạn"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? "" : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usagePerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lượt / khách</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
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
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kết thúc</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="appliesTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phạm vi áp dụng</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Toàn bộ giỏ hàng</SelectItem>
                      <SelectItem value="category">Theo danh mục</SelectItem>
                      <SelectItem value="product">Theo sản phẩm</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {appliesTo === "category" && (
              <FormField
                control={form.control}
                name="scopeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục áp dụng</FormLabel>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                      {(categories ?? []).map((category) => {
                        const id = String(category.id)
                        const checked = field.value.includes(id)
                        return (
                          <label key={id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                field.onChange(
                                  value
                                    ? [...field.value, id]
                                    : field.value.filter((item) => item !== id),
                                )
                              }}
                            />
                            {category.name}
                          </label>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {appliesTo === "product" && (
              <FormField
                control={form.control}
                name="scopeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sản phẩm áp dụng</FormLabel>
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                      {(products ?? []).map((product) => {
                        const id = String(product.id)
                        const checked = field.value.includes(id)
                        return (
                          <label key={id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                field.onChange(
                                  value
                                    ? [...field.value, id]
                                    : field.value.filter((item) => item !== id),
                                )
                              }}
                            />
                            <span className="line-clamp-1">{product.title}</span>
                          </label>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Lưu thay đổi" : "Tạo voucher"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}