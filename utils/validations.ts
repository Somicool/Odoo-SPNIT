import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().optional(),
  uom: z.string().optional(),
  reorder_level: z.number().int().nonnegative().optional()
})

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export type ProductInput = z.infer<typeof productSchema>
