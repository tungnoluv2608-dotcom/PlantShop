import { useEffect, useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Loader2, RotateCcw, Tag } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/PageHeader"
import { QueryBoundary } from "@/components/common/QueryBoundary"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { SingleImageUploader } from "@/components/common/ImageUploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"
import type { PrintSettings, ShopPrintConfig } from "@/types"
import {
  printPackingSlips,
  printShippingLabels,
} from "@/features/orders/print-documents"
import { usePrintSettings, useResetPrintSettings, useUpdatePrintSettings } from "../api"
import { PRINT_PREVIEW_ORDER } from "../preview-order"
import { printSettingsSchema, type PrintSettingsFormValues } from "../schema"
function toFormValues(settings: PrintSettings): PrintSettingsFormValues {
  return {
    shopName: settings.shopName,
    shopPhone: settings.shopPhone,
    shopAddress: settings.shopAddress,
    defaultNote: settings.defaultNote ?? "",
    logoUrl: settings.logoUrl ?? "",
  }
}

function toPrintConfig(values: PrintSettingsFormValues): ShopPrintConfig {
  return {
    shopName: values.shopName.trim(),
    shopPhone: values.shopPhone.trim(),
    shopAddress: values.shopAddress.trim(),
    defaultNote: values.defaultNote.trim() || null,
    logoUrl: values.logoUrl.trim() || null,
  }
}

export function PrintSettingsPage() {
  const settingsQuery = usePrintSettings()
  const updateSettings = useUpdatePrintSettings()
  const resetSettings = useResetPrintSettings()
  const [resetOpen, setResetOpen] = useState(false)

  const form = useForm<PrintSettingsFormValues>({
    resolver: zodResolver(printSettingsSchema),
    defaultValues: {
      shopName: "",
      shopPhone: "",
      shopAddress: "",
      defaultNote: "",
      logoUrl: "",
    },
  })

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(toFormValues(settingsQuery.data))
    }
  }, [settingsQuery.data, form])

  const onSubmit = (values: PrintSettingsFormValues) => {
    updateSettings.mutate(
      {
        shopName: values.shopName.trim(),
        shopPhone: values.shopPhone.trim(),
        shopAddress: values.shopAddress.trim(),
        defaultNote: values.defaultNote.trim(),
        logoUrl: values.logoUrl.trim(),
      },
      {
        onSuccess: (res) => toast.success(res.message),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      }
    )
  }

  const handleReset = () => {
    resetSettings.mutate(undefined, {
      onSuccess: (res) => {
        form.reset(toFormValues(res.settings))
        toast.success(res.message)
        setResetOpen(false)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const handlePreview = (type: "label" | "slip") => {
    const config = toPrintConfig(form.getValues())
    const previewOrder = {
      ...PRINT_PREVIEW_ORDER,
      internalNote: config.defaultNote,
    }
    if (type === "label") printShippingLabels([previewOrder], config)
    else printPackingSlips([previewOrder], config)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt in ấn"
        description="Thông tin shop hiển thị trên nhãn giao hàng và phiếu soạn hàng."
      />

      <QueryBoundary
        isLoading={settingsQuery.isLoading}
        isError={settingsQuery.isError}
        error={settingsQuery.error}
        onRetry={() => settingsQuery.refetch()}
        loadingFallback={
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Thông tin shop</CardTitle>
              <CardDescription>
                Dùng chung cho mọi nhân viên admin khi in đơn hàng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên shop</FormLabel>
                        <FormControl>
                          <Input placeholder="PlantShop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shopPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="090x xxx xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shopAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ gửi hàng</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Địa chỉ kho / cửa hàng" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú mặc định (tuỳ chọn)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={2}
                            placeholder="vd: Cây dễ vỡ, giao giờ hành chính"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Hiển thị trên nhãn/phiếu khi đơn không có ghi chú nội bộ riêng.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo (tuỳ chọn)</FormLabel>
                        <FormControl>
                          <SingleImageUploader value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={updateSettings.isPending}>
                      {updateSettings.isPending && <Loader2 className="size-4 animate-spin" />}
                      Lưu cài đặt
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResetOpen(true)}
                      disabled={resetSettings.isPending}
                    >
                      <RotateCcw className="size-4" />
                      Đặt lại mặc định
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Xem trước</CardTitle>
                <CardDescription>
                  In thử với đơn mẫu để kiểm tra bố cục trước khi lưu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePreview("slip")}
                >
                  <FileText className="size-4" />
                  Xem trước phiếu soạn
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePreview("label")}
                >
                  <Tag className="size-4" />
                  Xem trước nhãn giao
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gợi ý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Địa chỉ gửi nên trùng địa chỉ bạn khai báo với GHN/GHTK.</p>
                <p>
                  Quay lại{" "}
                  <Link to="/orders" className="font-medium text-foreground underline">
                    Danh sách đơn hàng
                  </Link>{" "}
                  để in thật.
                </p>
                {settingsQuery.data?.updatedAt && (
                  <p className="text-xs">
                    Cập nhật lần cuối: {formatDateTime(settingsQuery.data.updatedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </QueryBoundary>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Đặt lại cài đặt in ấn?"
        description="Thông tin shop sẽ về giá trị mặc định từ cấu hình server (.env)."
        confirmLabel="Đặt lại"
        destructive
        isLoading={resetSettings.isPending}
        onConfirm={handleReset}
      />
    </div>
  )
}