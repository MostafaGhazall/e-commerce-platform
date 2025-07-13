"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = exports.baseProductSchema = exports.categoryNamesSchema = exports.colorSchema = exports.imageSchema = exports.checkoutSchema = exports.loginSchema = exports.registerSchema = exports.updateProfileSchema = exports.urlSchema = exports.ALLOWED_PROTOCOLS = void 0;
const zod_1 = require("zod");
exports.ALLOWED_PROTOCOLS = [
    "http:",
    "https:",
    "data:",
    "ipfs:",
    "ar:",
    "ftp:",
];
/** Re‑usable URL schema with protocol whitelist */
exports.urlSchema = zod_1.z
    .string()
    .url("Must be a valid URL")
    .refine((u) => {
    try {
        return exports.ALLOWED_PROTOCOLS.includes(new URL(u).protocol);
    }
    catch {
        return false;
    }
}, { message: `URL must start with ${exports.ALLOWED_PROTOCOLS.join(" / ")}` });
/** Handy trimmed optional string helper */
const optionalTrimmed = (min = 1, max = 50) => zod_1.z
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
exports.updateProfileSchema = zod_1.z.object({
    firstName: optionalTrimmed(1, 50),
    lastName: optionalTrimmed(1, 50),
    birthday: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/u, "Invalid date format (YYYY‑MM‑DD)")
        .optional()
        .or(zod_1.z.literal("")),
    gender: zod_1.z.enum(["male", "female", "other"]).optional(),
    address: optionalTrimmed(1, 100),
    city: optionalTrimmed(1, 50),
    region: optionalTrimmed(1, 50),
    postalcode: zod_1.z
        .string()
        .regex(/^\d{3,10}$/u, "Invalid postal code")
        .optional()
        .or(zod_1.z.literal("")),
    country: optionalTrimmed(1, 50),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[0-9+\-\s]{6,15}$/u, "Invalid phone number")
        .optional()
        .or(zod_1.z.literal("")),
});
exports.registerSchema = zod_1.z
    .object({
    firstName: zod_1.z.string().trim().min(1),
    lastName: zod_1.z.string().trim().min(1),
    email: zod_1.z.string().trim().email(),
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
    email: zod_1.z.string().trim().email(),
    password: zod_1.z.string().min(1),
});
/* -------------------------------------------------------------------------- */
/* ⚙️  Checkout                                                               */
/* -------------------------------------------------------------------------- */
exports.checkoutSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Name is required"),
    email: zod_1.z.string().trim().email("Invalid email"),
    address: zod_1.z.string().trim().min(1, "Address is required"),
    country: zod_1.z.string().trim().min(1, "Country is required"),
    city: zod_1.z.string().trim().min(1, "City is required"),
    region: zod_1.z.string().trim().min(1, "Region is required"),
    postalcode: zod_1.z.string().trim().regex(/^\d{3,10}$/u, "Invalid postal code"),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[0-9+\-\s]{6,15}$/u, "Invalid phone number"),
});
/* -------------------------------------------------------------------------- */
/* ⚙️  Product primitives                                                     */
/* -------------------------------------------------------------------------- */
exports.imageSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    url: exports.urlSchema,
});
exports.colorSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().trim().min(1),
    value: zod_1.z.string().regex(/^#[0-9a-f]{6}$/iu, "Invalid hex color"),
    images: zod_1.z.array(exports.imageSchema),
});
exports.categoryNamesSchema = zod_1.z.object({
    en: zod_1.z.string().trim().min(1, "English name is required"),
    ar: zod_1.z.string().trim().min(1, "Arabic name is required"),
});
/* -------------------------------------------------------------------------- */
/* ⚙️  Product – create / update                                              */
/* -------------------------------------------------------------------------- */
exports.baseProductSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1),
    slug: zod_1.z
        .string()
        .trim()
        .min(1)
        .regex(/^[a-z0-9-]+$/u, "Invalid slug format"),
    price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(Number),
    description: zod_1.z.string().trim(),
    stock: zod_1.z.number().int().nonnegative(),
    categoryNames: exports.categoryNamesSchema,
    sizes: zod_1.z.array(zod_1.z.string().trim()).nonempty(),
    images: zod_1.z.array(exports.imageSchema).min(1, "At least one image"),
    colors: zod_1.z.array(exports.colorSchema),
});
exports.createProductSchema = exports.baseProductSchema;
exports.updateProductSchema = exports.baseProductSchema.extend({
    version: zod_1.z.number().int().nonnegative(),
});
