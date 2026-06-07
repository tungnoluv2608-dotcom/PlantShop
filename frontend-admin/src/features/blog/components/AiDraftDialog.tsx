import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Sparkles, Loader2 } from "lucide-react"
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
import type { BlogAiDraft } from "@/types"
import { aiDraftSchema, AI_DRAFT_DEFAULTS, type AiDraftFormValues } from "../schema"
import { useGenerateAiDraft } from "../api"

interface AiDraftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (draft: BlogAiDraft) => void
}

export function AiDraftDialog({ open, onOpenChange, onApply }: AiDraftDialogProps) {
  const generate = useGenerateAiDraft()

  const form = useForm<AiDraftFormValues>({
    resolver: zodResolver(aiDraftSchema),
    defaultValues: AI_DRAFT_DEFAULTS,
  })

  const onSubmit = (values: AiDraftFormValues) => {
    generate.mutate(values, {
      onSuccess: (draft) => {
        onApply(draft)
        toast.success("Đã tạo bản nháp. Bạn có thể chỉnh sửa trước khi lưu.")
        onOpenChange(false)
      },
      onError: (err) => toast.error(getApiErrorMessage(err, "Tạo bản nháp thất bại")),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> Tạo bản nháp bằng AI
          </DialogTitle>
          <DialogDescription>
            Mô tả chủ đề, AI sẽ tạo bản nháp markdown để bạn chỉnh sửa.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chủ đề</FormLabel>
                  <FormControl>
                    <Input placeholder="vd: Cách chăm sóc cây Monstera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <FormControl>
                      <Input placeholder="vd: Tin tức" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ dài (từ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={300}
                        max={5000}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
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
                name="audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đối tượng</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giọng văn</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Từ khóa</FormLabel>
                  <FormControl>
                    <Input placeholder="monstera, chăm sóc, tưới nước" {...field} />
                  </FormControl>
                  <FormDescription>Phân tách bằng dấu phẩy.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brief"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yêu cầu thêm</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="vd: Tập trung vào lời khuyên thực tế"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={generate.isPending}>
                {generate.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Tạo bản nháp
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
