"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.deleteProduct = exports.updateProduct = exports.getAllProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const library_1 = require("@prisma/client/runtime/library");
const client_1 = require("@prisma/client");
const parseIntSafe_1 = require("../utils/parseIntSafe");
const clamp_1 = require("../utils/clamp");
const userValidators_1 = require("../../../shared/userValidators");
const slugify_1 = __importDefault(require("slugify"));
/** Extract locale from ?lang=ar or default to "en" */
function getLocale(req) {
    return req.query.lang === "ar" ? "ar" : "en";
}
/* -------------------------------------------------------------------------- */
/* ✅ CREATE PRODUCT                                                          */
/* -------------------------------------------------------------------------- */
const createProduct = async (req, res) => {
    const parsed = userValidators_1.createProductSchema.safeParse(req.body);
    if (!parsed.success) {
        console.error("Create payload invalid:\n", parsed.error.format());
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const { name, slug, price, description, stock, categoryNames, sizes, images, colors, } = parsed.data;
    try {
        // 1️⃣ ensure product slug is unique
        const slugExists = await prisma_1.default.product.findUnique({ where: { slug } });
        if (slugExists) {
            res
                .status(409)
                .json({ ok: false, error: "Slug already exists, choose another" });
            return;
        }
        // 2️⃣ upsert category with names JSON
        const categorySlug = (0, slugify_1.default)(categoryNames.en, {
            lower: true,
            strict: true,
        });
        const category = await prisma_1.default.category.upsert({
            where: { slug: categorySlug },
            create: { slug: categorySlug, names: categoryNames },
            update: { names: categoryNames },
        });
        // 3️⃣ create product + nested relations
        const product = await prisma_1.default.product.create({
            data: {
                name,
                slug,
                price,
                description,
                stock,
                sizes,
                categoryId: category.id,
                images: { create: images.map((img) => ({ url: img.url })) },
                colors: {
                    create: colors.map((c) => ({
                        name: c.name,
                        value: c.value,
                        images: { create: c.images.map((img) => ({ url: img.url })) },
                    })),
                },
            },
            include: {
                images: true,
                colors: { include: { images: true } },
                category: true,
            },
        });
        // 4️⃣ respond with flattened category
        const locale = getLocale(req);
        const categoryNameLocalized = product.category.names[locale] ||
            product.category.slug;
        res.status(201).json({
            ok: true,
            data: {
                ...product,
                category: {
                    slug: product.category.slug,
                    name: categoryNameLocalized,
                },
            },
        });
        return;
    }
    catch (err) {
        console.error("Create product failed:", err);
        res
            .status(500)
            .json({ ok: false, error: err.message ?? "Server error" });
        return;
    }
};
exports.createProduct = createProduct;
/* -------------------------------------------------------------------------- */
/* ✅ GET ALL PRODUCTS (pagination)                                           */
/* -------------------------------------------------------------------------- */
const getAllProducts = async (req, res) => {
    const page = (0, clamp_1.clamp)((0, parseIntSafe_1.i)(req.query.page, 1), 1, 9999);
    const limit = (0, clamp_1.clamp)((0, parseIntSafe_1.i)(req.query.limit, 20), 1, 100);
    try {
        const locale = getLocale(req);
        // fetch total + paged results
        const [total, rows] = await prisma_1.default.$transaction([
            prisma_1.default.product.count(),
            prisma_1.default.product.findMany({
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    stock: true,
                    createdAt: true,
                    category: {
                        select: { names: true, slug: true },
                    },
                },
            }),
        ]);
        // flatten Decimal + category JSON → single `category.name`
        const data = rows.map((r) => {
            const catNames = r.category.names;
            const catName = catNames[locale] || r.category.slug;
            return {
                ...r,
                price: Number(r.price),
                category: { slug: r.category.slug, name: catName },
            };
        });
        res.json({
            ok: true,
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        });
        return;
    }
    catch (err) {
        console.error("Fetch products failed:", err);
        res.status(500).json({ ok: false, error: "Server error" });
        return;
    }
};
exports.getAllProducts = getAllProducts;
/* -------------------------------------------------------------------------- */
/* ✅ UPDATE PRODUCT  – nested write + optimistic concurrency                 */
/* -------------------------------------------------------------------------- */
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const parsed = userValidators_1.updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const locale = getLocale(req);
    const clientVersion = parsed.data.version;
    const { name, slug, price, description, stock, categoryNames, sizes, images = [], colors = [], } = parsed.data;
    try {
        // 1️⃣ fetch current version
        const exists = await prisma_1.default.product.findUnique({
            where: { id },
            select: { version: true },
        });
        if (!exists) {
            res.status(404).json({ ok: false, error: "Product not found" });
            return;
        }
        if (exists.version !== clientVersion) {
            res
                .status(409)
                .json({ ok: false, error: "Product changed, reload and try again." });
            return;
        }
        // 2️⃣ upsert category with JSON
        const categorySlug = (0, slugify_1.default)(categoryNames.en, {
            lower: true,
            strict: true,
        });
        const category = await prisma_1.default.category.upsert({
            where: { slug: categorySlug },
            create: { slug: categorySlug, names: categoryNames },
            update: { names: categoryNames },
            select: { id: true, names: true },
        });
        // 3️⃣ prepare deletions
        const imageIdsInPayload = images.filter((i) => i.id).map((i) => i.id);
        const colorIdsInPayload = colors.filter((c) => c.id).map((c) => c.id);
        // 4️⃣ update product
        const updated = await prisma_1.default.product.update({
            where: { id, version: clientVersion },
            data: {
                version: { increment: 1 },
                name,
                slug,
                price,
                description,
                stock,
                sizes,
                category: { connect: { id: category.id } },
                images: {
                    deleteMany: { id: { notIn: imageIdsInPayload } },
                    upsert: images.map((img) => ({
                        where: { id: img.id ?? "__new__" },
                        create: { url: img.url },
                        update: { url: img.url },
                    })),
                },
                colors: {
                    deleteMany: { id: { notIn: colorIdsInPayload } },
                    upsert: colors.map((col) => {
                        const colImageIds = col.images.filter((i) => i.id).map((i) => i.id) || [];
                        return {
                            where: { id: col.id ?? "__new__" },
                            create: {
                                name: col.name,
                                value: col.value,
                                images: {
                                    createMany: { data: col.images.map((i) => ({ url: i.url })) },
                                },
                            },
                            update: {
                                name: col.name,
                                value: col.value,
                                images: {
                                    deleteMany: { id: { notIn: colImageIds } },
                                    upsert: col.images.map((img) => ({
                                        where: { id: img.id ?? "__new__" },
                                        create: { url: img.url },
                                        update: { url: img.url },
                                    })),
                                },
                            },
                        };
                    }),
                },
            },
            include: {
                images: true,
                colors: { include: { images: true } },
                category: true,
            },
        });
        /* 🔄  sweep: delete every category that now has zero products */
        await prisma_1.default.category.deleteMany({
            where: { products: { none: {} } },
        });
        // 5️⃣ flatten category JSON → name
        const catNames = updated.category.names;
        const catName = catNames[locale] || updated.category.slug;
        res.json({
            ok: true,
            data: {
                ...updated,
                category: { slug: updated.category.slug, name: catName },
            },
        });
        return;
    }
    catch (err) {
        // handle known Prisma errors
        if (err instanceof library_1.PrismaClientKnownRequestError &&
            err.code === "P2002" &&
            Array.isArray(err.meta?.target) &&
            err.meta.target.includes("slug")) {
            res.status(409).json({ ok: false, error: "Slug already exists" });
            return;
        }
        if (err instanceof library_1.PrismaClientKnownRequestError && err.code === "P2025") {
            res
                .status(409)
                .json({ ok: false, error: "Product changed, reload and try again." });
            return;
        }
        console.error("Update product failed:", err);
        res.status(500).json({ ok: false, error: "Server error" });
        return;
    }
};
exports.updateProduct = updateProduct;
/* -------------------------------------------------------------------------- */
/* ✅ DELETE PRODUCT                                                          */
/* -------------------------------------------------------------------------- */
const deleteProduct = async (req, res, next) => {
    try {
        await prisma_1.default.product.delete({ where: { id: req.params.id } });
        /* 🔄  sweep categories that are now empty */
        await prisma_1.default.category.deleteMany({
            where: { products: { none: {} } },
        });
        res.status(204).end();
        return;
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === "P2003") {
            res
                .status(409)
                .json({ ok: false, error: "Product is referenced elsewhere" });
            return;
        }
        return next(err);
    }
};
exports.deleteProduct = deleteProduct;
/* -------------------------------------------------------------------------- */
/* ✅ GET SINGLE PRODUCT                                                      */
/* -------------------------------------------------------------------------- */
const getProductById = async (req, res) => {
    try {
        const locale = getLocale(req);
        const product = await prisma_1.default.product.findUnique({
            where: { id: req.params.id },
            include: {
                images: true,
                colors: { include: { images: true } },
                category: { select: { names: true, slug: true } },
            },
        });
        if (!product) {
            res.status(404).json({ ok: false, error: "Product not found" });
            return;
        }
        // flatten category JSON → name
        const catNames = product.category.names;
        const catName = catNames[locale] || product.category.slug;
        res.json({
            ok: true,
            data: {
                ...product,
                price: Number(product.price),
                category: { slug: product.category.slug, name: catName },
            },
        });
        return;
    }
    catch (err) {
        console.error("Fetch product failed:", err);
        res
            .status(500)
            .json({ ok: false, error: err.message ?? "Server error" });
        return;
    }
};
exports.getProductById = getProductById;
