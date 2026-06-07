import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star, X, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-client"
import { uploadImages } from "@/lib/upload"
import { reviewSchema, type ReviewFormValues } from "../schema"
import { useCreateReview } from "../api"

const MAX_IMAGES = 5

export function ReviewForm({ productId, onDone }: { productId: string; onDone?: () => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [tagInput, setTagInput] = useState("")
  const createReview = useCreateReview(productId)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: "", content: "", tags: [] },
  })

  const rating = form.watch("rating")
  const tags = form.watch("tags") ?? []

  const addTag = () => {
    const value = tagInput.trim()
    if (!value || tags.includes(value) || tags.length >= 8) return
    form.setValue("tags", [...tags, value])
    setTagInput("")
  }

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      const images = files.length > 0 ? await uploadImages(files.slice(0, MAX_IMAGES)) : []
      await createReview.mutateAsync({
        productId,
        rating: values.rating,
        title: values.title,
        content: values.content,
        tags: values.tags ?? [],
        images,
      })
      toast.success("Đánh giá đã được gửi")
      form.reset({ rating: 0, title: "", content: "", tags: [] })
      setFiles([])
      onDone?.()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border p-5">
        <h3 className="font-semibold">Viết đánh giá của bạn</h3>

        <FormField
          control={form.control}
          name="rating"
          render={() => (
            <FormItem>
              <FormLabel>Đánh giá sao</FormLabel>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = i + 1
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => form.setValue("rating", value, { shouldValidate: true })}
                      aria-label={`${value} sao`}
                    >
                      <Star
                        className={cn(
                          "size-7 transition-colors",
                          value <= rating
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/40",
                        )}
                      />
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input placeholder="Tóm tắt cảm nhận" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Thẻ (tối đa 8)</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="vd: tươi, đóng gói kỹ"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Thêm
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => form.setValue("tags", tags.filter((t) => t !== tag))}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Hình ảnh (tối đa 5)</Label>
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div key={i} className="relative size-20">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="size-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <label className="flex size-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted">
                <ImagePlus className="size-5" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files ?? [])
                    setFiles((prev) => [...prev, ...selected].slice(0, MAX_IMAGES))
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting || createReview.isPending}>
          {form.formState.isSubmitting || createReview.isPending ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </form>
    </Form>
  )
}
