import { z } from "zod"

export const blogSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  image: z.string().min(1, "Vui lòng tải ảnh bìa"),
  excerpt: z.string(),
  content: z.string().min(1, "Vui lòng nhập nội dung"),
  category: z.string().min(1, "Vui lòng nhập danh mục"),
  readTime: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean(),
  date: z.string(),
})

export type BlogFormValues = z.infer<typeof blogSchema>

export const BLOG_FORM_DEFAULTS: BlogFormValues = {
  title: "",
  image: "",
  excerpt: "",
  content: "",
  category: "",
  readTime: "",
  tags: [],
  featured: false,
  date: "",
}

// AI draft request form
export const aiDraftSchema = z.object({
  topic: z.string().min(1, "Vui lòng nhập chủ đề"),
  category: z.string().min(1, "Vui lòng nhập danh mục"),
  audience: z.string(),
  tone: z.string(),
  keywords: z.string(),
  brief: z.string(),
  desiredLength: z.number().min(300).max(5000),
})

export type AiDraftFormValues = z.infer<typeof aiDraftSchema>

export const AI_DRAFT_DEFAULTS: AiDraftFormValues = {
  topic: "",
  category: "Tin tức",
  audience: "người yêu cây cảnh",
  tone: "thân thiện, chuyên môn dễ hiểu",
  keywords: "",
  brief: "",
  desiredLength: 1200,
}
