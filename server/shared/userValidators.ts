import { z } from "zod";

export const ALLOWED_PROTOCOLS = [
  "http:",
  "https:",
  "data:",
  "ipfs:",
  "ar:",
  "ftp:",
] as const;

/** Re‑usable URL schema with protocol whitelist */
export const urlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (u) => {
      try {
        return ALLOWED_PROTOCOLS.includes(new URL(u).protocol as any);
      } catch {
        return false;
      }
    },
    { message: `URL must start with ${ALLOWED_PROTOCOLS.join(" / ")}` }
  );

/** Handy trimmed optional string helper */
const optionalTrimmed = (min = 1, max = 50) =>
  z
    .string()
    .trim()
    .refine((v) => v.length === 0 || v.length >= min, {
      message: `Must be at least ${min} characters`,
    })
    .refine((v) => v.length === 0 || v.length <= max, {
      message: `Must be at most ${max} characters`,
    })
    .optional();

/* -------------------------------------------------------------------------- */
/* ⚙️  Profile / Auth                                                         */
/* -------------------------------------------------------------------------- */
export const updateProfileSchema = z.object({
  firstName: optionalTrimmed(1, 50),
  lastName: optionalTrimmed(1, 50),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u, "Invalid date format (YYYY‑MM‑DD)")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: optionalTrimmed(1, 100),
  city: optionalTrimmed(1, 50),
  region: optionalTrimmed(1, 50),
  postalcode: z
    .string()
    .regex(/^\d{3,10}$/u, "Invalid postal code")
    .optional()
    .or(z.literal("")),
  country: optionalTrimmed(1, 50),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,15}$/u, "Invalid phone number")
    .optional()
    .or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.string().trim().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: "Must agree" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/* ⚙️  Checkout                                                               */
/* -------------------------------------------------------------------------- */
export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  address: z.string().trim().min(1, "Address is required"),
  country: z.string().trim().min(1, "Country is required"),
  city: z.string().trim().min(1, "City is required"),
  region: z.string().trim().min(1, "Region is required"),
  postalcode: z.string().trim().regex(/^\d{3,10}$/u, "Invalid postal code"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,15}$/u, "Invalid phone number"),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/* -------------------------------------------------------------------------- */
/* ⚙️  Product primitives                                                     */
/* -------------------------------------------------------------------------- */
export const imageSchema = z.object({
  id: z.string().optional(),
  url: urlSchema,
});

export const colorSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  value: z.string().regex(/^#[0-9a-f]{6}$/iu, "Invalid hex color"),
  images: z.array(imageSchema),
});

export const categoryNamesSchema = z.object({
  en: z.string().trim().min(1, "English name is required"),
  ar: z.string().trim().min(1, "Arabic name is required"),
});
export type CategoryNames = z.infer<typeof categoryNamesSchema>;

/* -------------------------------------------------------------------------- */
/* ⚙️  Product – create / update                                              */
/* -------------------------------------------------------------------------- */
export const baseProductSchema = z.object({
  name: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/u, "Invalid slug format"),
  price: z.union([z.string(), z.number()]).transform(Number),
  description: z.string().trim(),
  stock: z.number().int().nonnegative(),
  categoryNames: categoryNamesSchema,
  sizes: z.array(z.string().trim()).nonempty(),
  images: z.array(imageSchema).min(1, "At least one image"),
  colors: z.array(colorSchema),
});

export const createProductSchema = baseProductSchema;
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = baseProductSchema.extend({
  version: z.number().int().nonnegative(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

