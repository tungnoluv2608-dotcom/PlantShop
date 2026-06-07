import type { BlogPost, BlogPayload } from "@/types"
import type { BlogFormValues } from "./schema"
import { BLOG_FORM_DEFAULTS } from "./schema"

export function toBlogPayload(values: BlogFormValues): BlogPayload {
  const payload: BlogPayload = {
    title: values.title,
    image: values.image,
    excerpt: values.excerpt,
    content: values.content,
    category: values.category,
    tags: values.tags,
    featured: values.featured,
  }
  if (values.readTime.trim()) payload.readTime = values.readTime.trim()
  if (values.date.trim()) payload.date = values.date.trim()
  return payload
}

export function toBlogFormValues(post: BlogPost): BlogFormValues {
  return {
    ...BLOG_FORM_DEFAULTS,
    title: post.title,
    image: post.image,
    excerpt: post.excerpt ?? "",
    content: post.content,
    category: post.category,
    readTime: post.readTime ?? "",
    tags: post.tags ?? [],
    featured: post.featured ?? false,
    date: (post.date ?? "").slice(0, 10),
  }
}
