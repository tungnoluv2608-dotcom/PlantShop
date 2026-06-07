import { z } from "zod"

export const WHOLESALE_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "lost",
  "archived",
] as const

export const wholesaleUpdateSchema = z.object({
  status: z.enum(WHOLESALE_STATUSES),
  assignedTo: z.string(),
  adminNote: z.string(),
})

export type WholesaleUpdateFormValues = z.infer<typeof wholesaleUpdateSchema>
