import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  birthday: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.union([z.string().min(1).max(100), z.literal(""), z.undefined()]).optional(),
  city: z.union([z.string().min(1).max(50), z.literal(""), z.undefined()]).optional(),
  region: z.union([z.string().min(1).max(50), z.literal(""), z.undefined()]).optional(),
  postalcode: z
    .union([
      z.string().regex(/^\d{3,10}$/, "Invalid postal code"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  country: z.union([z.string().min(1).max(50), z.literal(""), z.undefined()]).optional(),
  phone: z
    .union([
      z.string().regex(/^[0-9+\-\s]{6,15}$/, "Invalid phone number"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
