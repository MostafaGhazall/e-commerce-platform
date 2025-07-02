import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1)
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((val) => val?.trim()),
  lastName: z
    .string()
    .min(1)
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((val) => val?.trim()),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().min(1).max(100).optional().or(z.literal("")),
  city: z.string().min(1).max(50).optional().or(z.literal("")),
  region: z.string().min(1).max(50).optional().or(z.literal("")),
  postalcode: z
    .string()
    .regex(/^\d{3,10}$/, "Invalid postal code")
    .optional()
    .or(z.literal("")),
  country: z.string().min(1).max(50).optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{6,15}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
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
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  address: z.string().trim().min(1, "Address is required"),
  country: z.string().trim().min(1, "Country is required"),
  city: z.string().trim().min(1, "City is required"),
  region: z.string().trim().min(1, "Region is required"),
  postalcode: z
    .string()
    .trim()
    .regex(/^\d{3,10}$/, "Invalid postal code"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,15}$/, "Invalid phone number"),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Invalid image URL"),
});

export const colorImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Invalid color image URL"),
});

export const colorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  value: z.string().regex(/^#[0-9a-f]{6}$/i, "Invalid hex color"),
  images: z.array(colorImageSchema),
});

export const updateProductSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  price: z.union([z.string(), z.number()]).transform(Number),
  description: z.string(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1),
  sizes: z.array(z.string()).nonempty(),
  images: z.array(productImageSchema),
  colors: z.array(colorSchema),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
