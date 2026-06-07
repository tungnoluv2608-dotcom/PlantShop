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
import type { Category } from "@/types"
import { categorySchema, type CategoryFormValues } from "../schema"
import { useCreateCategory, useUpdateCategory } from "../api"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the dialog edits this category; otherwise it creates. */
  category?: Category | null
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const isEdit = Boolean(category)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", image: "", subcategories: [] },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        image: category?.image ?? "",
        subcategories: category?.subcategories ?? [],
      })
    }
  }, [open, category, form])

  const onSubmit = (values: CategoryFormValues) => {
    const onSuccess = (res: { message: string }) => {
      toast.success(res.message)
      onOpenChange(false)
    }
    const onError = (err: unknown) => toast.error(getApiErrorMessage(err))

    if (isEdit && category) {
      updateCategory.mutate(
        { id: String(category.id), payload: values },
        { onSuccess, onError }
      )
    } else {
      createCategory.mutate(values, { onSuccess, onError })
    }
  }

  const isPending = createCategory.isPending || updateCategory.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa danh mục" : "Tạo danh mục"}</DialogTitle>
          <DialogDescription>
            Danh mục giúp phân loại sản phẩm trong cửa hàng.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="vd: Cây trong nhà" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh danh mục</FormLabel>
                  <FormControl>
                    <SingleImageUploader value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục con</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="vd: Để bàn, Để sàn..."
                    />
                  </FormControl>
                  <FormMessage />
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
