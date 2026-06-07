import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Sparkles, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Markdown } from "@/components/common/Markdown"
import type { BlogAiDraft } from "@/types"
import { blogSchema, type BlogFormValues } from "../schema"
import { AiDraftDialog } from "./AiDraftDialog"

interface BlogFormProps {
  defaultValues: BlogFormValues
  onSubmit: (values: BlogFormValues) => void
  isSubmitting: boolean
  submitLabel: string
}

export function BlogForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: BlogFormProps) {
  const [aiOpen, setAiOpen] = useState(false)

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues,
  })

  const content = form.watch("content")

  const applyDraft = (draft: BlogAiDraft) => {
    form.setValue("title", draft.title, { shouldDirty: true })
    form.setValue("excerpt", draft.excerpt, { shouldDirty: true })
    form.setValue("content", draft.content, { shouldDirty: true })
    form.setValue("category", draft.category, { shouldDirty: true })
    form.setValue("readTime", draft.readTime, { shouldDirty: true })
    form.setValue("tags", draft.tags ?? [], { shouldDirty: true })
    form.setValue("featured", draft.featured ?? false, { shouldDirty: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => setAiOpen(true)}>
            <Sparkles className="size-4" /> Tạo bằng AI
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input placeholder="Tiêu đề bài viết" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="Mô tả ngắn..." {...field} />
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
                      <FormLabel>Nội dung (Markdown)</FormLabel>
                      <Tabs defaultValue="edit">
                        <TabsList>
                          <TabsTrigger value="edit">Soạn thảo</TabsTrigger>
                          <TabsTrigger value="preview">Xem trước</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                          <FormControl>
                            <Textarea
                              rows={18}
                              className="font-mono text-sm"
                              placeholder="# Tiêu đề&#10;&#10;Nội dung markdown..."
                              {...field}
                            />
                          </FormControl>
                        </TabsContent>
                        <TabsContent value="preview">
                          <div className="min-h-[24rem] rounded-lg border border-border p-4">
                            {content ? (
                              <Markdown>{content}</Markdown>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Chưa có nội dung để xem trước.
                              </p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ảnh bìa</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SingleImageUploader value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thuộc tính</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  name="readTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian đọc</FormLabel>
                      <FormControl>
                        <Input placeholder="vd: 5 phút (để trống = tự tính)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày đăng</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thẻ</FormLabel>
                      <FormControl>
                        <TagInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                      <FormLabel className="mb-0">Bài nổi bật</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>

      <AiDraftDialog open={aiOpen} onOpenChange={setAiOpen} onApply={applyDraft} />
    </Form>
  )
}
