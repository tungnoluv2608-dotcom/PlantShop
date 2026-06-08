import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  CheckCircle2,
  Check,
  Phone,
  Truck,
  Leaf,
} from "lucide-react"
import { toast } from "sonner"
import heroImage from "@/assets/hero.png"
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
import {
  BENEFITS,
  BUDGET_OPTIONS,
  HIGHLIGHTS,
  PROCESS_STEPS,
  SPACE_OPTIONS,
  TIMELINE_OPTIONS,
} from "../constants"
import { WholesaleProductPicker } from "../components/WholesaleProductPicker"

const HIGHLIGHT_ICONS = [Building2, Truck, Phone] as const

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
    <div className="pb-16">
      <section
        className="relative overflow-hidden border-b"
        style={{
          backgroundImage: `linear-gradient(rgba(24,34,26,0.72), rgba(24,34,26,0.72)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              <Building2 className="size-4" /> Mua sỉ / B2B
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white md:text-5xl">
              Mua cây số lượng lớn, quy trình rõ ràng, liên hệ nhanh
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              Gửi nhu cầu của bạn để nhận báo giá theo quy mô thực tế, kèm tư vấn chọn cây phù hợp.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = HIGHLIGHT_ICONS[index] ?? Leaf
            return (
              <Card key={item.title} className="border-border/80 shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vì sao nên gửi yêu cầu tại đây?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {BENEFITS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-primary/5">
            <CardHeader>
              <CardTitle>Quy trình ngắn gọn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-6 text-foreground/80">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Yêu cầu báo giá</CardTitle>
            <p className="text-sm text-muted-foreground">
              Điền thông tin cơ bản để chúng tôi liên hệ lại.
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
      </section>
    </div>
  )
}