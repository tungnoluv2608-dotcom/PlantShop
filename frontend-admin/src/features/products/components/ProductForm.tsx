import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SingleImageUploader, MultiImageUploader } from "@/components/common/ImageUploader"
import { useCategories } from "@/features/categories/api"
import { usePlanters } from "@/features/planters/api"
import { productSchema, type ProductFormValues } from "../schema"

interface ProductFormProps {
  defaultValues: ProductFormValues
  onSubmit: (values: ProductFormValues) => void
  isSubmitting: boolean
  submitLabel: string
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ProductFormProps) {
  const { data: categories } = useCategories()
  const { data: planters } = usePlanters("planter")

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const careGuide = useFieldArray({
    control: form.control,
    name: "careGuide",
  })

  const selectedPlanters = form.watch("planterOptions")

  const togglePlanter = (id: string) => {
    const current = form.getValues("planterOptions")
    form.setValue(
      "planterOptions",
      current.includes(id)
        ? current.filter((p) => p !== id)
        : [...current, id],
      { shouldDirty: true }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="vd: Monstera Deliciosa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Mô tả sản phẩm..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thông tin thêm</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Đặc điểm nổi bật..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn chăm sóc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {careGuide.fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Chưa có mục hướng dẫn nào.
                  </p>
                )}
                {careGuide.fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="space-y-3 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Mục #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => careGuide.remove(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`careGuide.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Tiêu đề (vd: Tưới nước)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`careGuide.${index}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea rows={2} placeholder="Nội dung hướng dẫn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => careGuide.append({ title: "", content: "" })}
                >
                  <Plus className="size-4" /> Thêm mục
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tùy chọn chậu kèm theo</CardTitle>
              </CardHeader>
              <CardContent>
                {!planters || planters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có chậu cây nào để chọn.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {planters.map((planter) => {
                      const checked = selectedPlanters.includes(String(planter.id))
                      return (
                        <button
                          key={planter.id}
                          type="button"
                          onClick={() => togglePlanter(String(planter.id))}
                          className={`flex items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <img
                            src={planter.imageUrl}
                            alt={planter.name}
                            width={40}
                            height={40}
                            className="size-10 rounded object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{planter.name}</p>
                            <p className="text-xs text-muted-foreground">{planter.material}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ảnh chính</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SingleImageUploader
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thư viện ảnh</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiImageUploader
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Lưu ý: cập nhật sẽ thay thế toàn bộ thư viện ảnh.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giá & danh mục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(categories ?? []).map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán (₫)</FormLabel>
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
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá gốc (₫)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : e.target.valueAsNumber
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhãn giảm giá</FormLabel>
                      <FormControl>
                        <Input placeholder="vd: 10%" {...field} />
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
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
