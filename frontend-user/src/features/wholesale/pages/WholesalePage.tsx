import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
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
import { useCategories } from "@/features/catalog/api"
import { wholesaleSchema, type WholesaleFormValues } from "../schema"
import { useSubmitWholesale } from "../api"
import { BUDGET_OPTIONS, SPACE_OPTIONS, TIMELINE_OPTIONS } from "../constants"
import { WholesaleProductPicker } from "../components/WholesaleProductPicker"

export function WholesalePage() {
  const submitWholesale = useSubmitWholesale()
  const { data: categories } = useCategories()

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
      interestedCategories: [],
      interestedProducts: [],
    },
  })

  const selectedCategories = form.watch("interestedCategories")

  const toggleCategory = (id: string, name: string) => {
    const current = form.getValues("interestedCategories")
    const exists = current.some((item) => item.id === id)
    if (exists) {
      form.setValue(
        "interestedCategories",
        current.filter((item) => item.id !== id),
        { shouldDirty: true }
      )
      return
    }
    if (current.length >= 20) return
    form.setValue("interestedCategories", [...current, { id, name }], { shouldDirty: true })
  }

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
          Cảm ơn bạn! Đội ngũ PlantShop sẽ liên hệ trong thời gian sớm nhất.
          Nếu đã cấu hình email, bạn sẽ nhận được email xác nhận.
        </p>
        <Button onClick={() => submitWholesale.reset()}>Gửi yêu cầu khác</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Yêu cầu báo giá mua sỉ</CardTitle>
          <p className="text-sm text-muted-foreground">
            Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại sớm nhất.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên công ty *</FormLabel>
                      <FormControl>
                        <Input placeholder="Công ty ABC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người liên hệ *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="0901 234 567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hr@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng dự kiến *</FormLabel>
                      <FormControl>
                        <Input placeholder="vd: 50 chậu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại không gian</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn loại không gian" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPACE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa điểm triển khai</FormLabel>
                      <FormControl>
                        <Input placeholder="vd: Quận 1, TP.HCM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách dự kiến</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn ngân sách" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUDGET_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="timeline"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Thời gian triển khai</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn thời gian" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMELINE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {categories && categories.length > 0 && (
                <FormItem>
                  <FormLabel>Danh mục quan tâm</FormLabel>
                  <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                    {categories.map((category) => {
                      const checked = selectedCategories.some((item) => item.id === category.id)
                      return (
                        <label
                          key={category.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCategory(category.id, category.name)}
                          />
                          <span>{category.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </FormItem>
              )}

              <FormField
                control={form.control}
                name="interestedProducts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sản phẩm quan tâm</FormLabel>
                    <FormControl>
                      <WholesaleProductPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả nhu cầu</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Ví dụ: cần cây cho văn phòng, ưu tiên dễ chăm..."
                        {...field}
                      />
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