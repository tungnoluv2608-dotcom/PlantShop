import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getApiErrorMessage } from "@/lib/api-client"
import { wholesaleSchema, type WholesaleFormValues } from "../schema"
import { useSubmitWholesale } from "../api"

const FIELDS: { name: keyof WholesaleFormValues; label: string; placeholder?: string }[] = [
  { name: "company", label: "Tên công ty" },
  { name: "contact", label: "Người liên hệ" },
  { name: "phone", label: "Số điện thoại" },
  { name: "email", label: "Email" },
  { name: "quantity", label: "Số lượng dự kiến", placeholder: "vd: 50 chậu" },
  { name: "type", label: "Loại hình", placeholder: "vd: Văn phòng" },
  { name: "location", label: "Khu vực", placeholder: "vd: TP.HCM" },
  { name: "budget", label: "Ngân sách", placeholder: "vd: 10-20 triệu" },
  { name: "timeline", label: "Thời gian", placeholder: "vd: Trong 2 tuần" },
]

export function WholesalePage() {
  const submitWholesale = useSubmitWholesale()
  const form = useForm<WholesaleFormValues>({
    resolver: zodResolver(wholesaleSchema),
    defaultValues: {
      company: "",
      contact: "",
      phone: "",
      email: "",
      quantity: "",
      type: "",
      location: "",
      budget: "",
      timeline: "",
      note: "",
    },
  })

  const onSubmit = (values: WholesaleFormValues) => {
    submitWholesale.mutate(values, {
      onSuccess: (data) => {
        toast.success(data.message)
        form.reset()
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  if (submitWholesale.isSuccess) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <h1 className="text-2xl font-semibold">Đã gửi yêu cầu báo giá</h1>
        <p className="text-muted-foreground">
          Cảm ơn bạn! Đội ngũ PlantWeb sẽ liên hệ trong thời gian sớm nhất.
        </p>
        <Button onClick={() => submitWholesale.reset()}>Gửi yêu cầu khác</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Building2 className="size-4" /> Mua sỉ / B2B
        </span>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Yêu cầu báo giá số lượng lớn</h1>
        <p className="mt-2 text-muted-foreground">
          Cung cấp cây xanh cho văn phòng, dự án, sự kiện với giá ưu đãi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
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
              </div>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Mô tả chi tiết nhu cầu của bạn..." {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={submitWholesale.isPending}>
                {submitWholesale.isPending ? "Đang gửi..." : "Gửi yêu cầu báo giá"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
