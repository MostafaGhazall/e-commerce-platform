"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = exports.updateProductSchema = exports.colorSchema = exports.colorImageSchema = exports.productImageSchema = exports.checkoutSchema = exports.loginSchema = exports.registerSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z
        .string()
        .min(1)
        .max(50)
        .optional()
        .or(zod_1.z.literal(""))
        .transform((val) => val?.trim()),
    lastName: zod_1.z
        .string()
        .min(1)
        .max(50)
        .optional()
        .or(zod_1.z.literal(""))
        .transform((val) => val?.trim()),
    birthday: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
        .optional()
        .or(zod_1.z.literal("")),
    gender: zod_1.z.enum(["male", "female", "other"]).optional(),
    address: zod_1.z.string().min(1).max(100).optional().or(zod_1.z.literal("")),
    city: zod_1.z.string().min(1).max(50).optional().or(zod_1.z.literal("")),
    region: zod_1.z.string().min(1).max(50).optional().or(zod_1.z.literal("")),
    postalcode: zod_1.z
        .string()
        .regex(/^\d{3,10}$/, "Invalid postal code")
        .optional()
        .or(zod_1.z.literal("")),
    country: zod_1.z.string().min(1).max(50).optional().or(zod_1.z.literal("")),
    phone: zod_1.z
        .string()
        .regex(/^[0-9+\-\s]{6,15}$/, "Invalid phone number")
        .optional()
        .or(zod_1.z.literal("")),
});
exports.registerSchema = zod_1.z
    .object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    confirmPassword: zod_1.z.string().min(6),
    agreeTerms: zod_1.z.literal(true, {
        errorMap: () => ({ message: "Must agree" }),
    }),
})
    .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.checkoutSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Name is required"),
    email: zod_1.z.string().trim().email("Invalid email"),
    address: zod_1.z.string().trim().min(1, "Address is required"),
    country: zod_1.z.string().trim().min(1, "Country is required"),
    city: zod_1.z.string().trim().min(1, "City is required"),
    region: zod_1.z.string().trim().min(1, "Region is required"),
    postalcode: zod_1.z
        .string()
        .trim()
        .regex(/^\d{3,10}$/, "Invalid postal code"),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[0-9+\-\s]{6,15}$/, "Invalid phone number"),
});
exports.productImageSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    url: zod_1.z.string().url("Invalid image URL"),
});
exports.colorImageSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    url: zod_1.z.string().url("Invalid color image URL"),
});
exports.colorSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    value: zod_1.z.string().regex(/^#[0-9a-f]{6}$/i, "Invalid hex color"),
    images: zod_1.z.array(exports.colorImageSchema),
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
    price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(Number),
    description: zod_1.z.string(),
    stock: zod_1.z.number().int().nonnegative(),
    categoryName: zod_1.z.string().min(1), // updated to support dynamic categories
    sizes: zod_1.z.array(zod_1.z.string()).nonempty(),
    images: zod_1.z.array(exports.productImageSchema),
    colors: zod_1.z.array(exports.colorSchema),
    version: zod_1.z.number().int().nonnegative(),
});
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
    price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(Number),
    description: zod_1.z.string(),
    stock: zod_1.z.number().int().nonnegative(),
    categoryName: zod_1.z.string().min(1), // dynamic category creation
    sizes: zod_1.z.array(zod_1.z.string()).nonempty(),
    images: zod_1.z.array(exports.productImageSchema),
    colors: zod_1.z.array(exports.colorSchema),
});
