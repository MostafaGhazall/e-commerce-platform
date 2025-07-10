export const STATIC_CATEGORY_SLUGS = [
  "clothing",
  "accessories",
  "electronics",
  "furniture",
] as const;
export type StaticCategorySlug = typeof STATIC_CATEGORY_SLUGS[number];