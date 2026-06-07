import { z } from "zod"

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Vui lòng chọn số sao").max(5),
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự"),
  content: z.string().min(10, "Nội dung tối thiểu 10 ký tự"),
  tags: z.array(z.string()).max(8, "Tối đa 8 thẻ").optional(),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
