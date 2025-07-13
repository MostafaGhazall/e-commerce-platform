import { z } from "zod";

/* ---------- primitives & helpers ---------- */
export const CategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number(),
  stock: z.number(),
  createdAt: z.string(),
  category: CategorySchema.nullable(),
});
export type Product = z.infer<typeof ProductSchema>;

export const MetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type Meta = z.infer<typeof MetaSchema>;

/* ---------- list endpoint envelope ---------- */
export const ProductsResSchema = z.object({
  ok: z.boolean().optional(),
  data: z.array(ProductSchema),
  meta: MetaSchema,
});
export type ProductsRes = z.infer<typeof ProductsResSchema>;
