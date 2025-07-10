"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.deleteProduct = exports.updateProduct = exports.getAllProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const library_1 = require("@prisma/client/runtime/library");
const parseIntSafe_1 = require("../utils/parseIntSafe");
const userValidators_1 = require("../../../shared/userValidators");
const slugify_1 = __importDefault(require("slugify"));
/* -------------------------------------------------------------------------- */
/* ✅ CREATE PRODUCT                                                          */
/* -------------------------------------------------------------------------- */
const createProduct = async (req, res) => {
    const parsed = userValidators_1.createProductSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const { name, slug, price, description, stock, categoryName, sizes, images, colors, } = parsed.data;
    try {
        /* 1️⃣ ensure slug uniqueness */
        const slugExists = await prisma_1.default.product.findUnique({ where: { slug } });
        if (slugExists) {
            res
                .status(409)
                .json({ ok: false, error: "Slug already exists, choose another" });
            return;
        }
        /* 2️⃣ upsert category */
        const categorySlug = (0, slugify_1.default)(categoryName, { lower: true });
        const category = await prisma_1.default.category.upsert({
            where: { slug: categorySlug },
            create: { name: categoryName, slug: categorySlug },
            update: {},
        });
        /* 3️⃣ create product + nested */
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
        res.status(201).json({ ok: true, data: product });
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
/* ✅ GET ALL PRODUCTS (pagination coming in Step 4)                          */
/* -------------------------------------------------------------------------- */
const getAllProducts = async (req, res) => {
    const num = (q) => {
        if (typeof q !== "string")
            return undefined;
        const n = Number(q);
        return Number.isFinite(n) ? n : undefined;
    };
    /* 1️⃣ pull & sanitise query params ------------------------------------- */
    const page = Math.min(Math.max((0, parseIntSafe_1.i)(req.query.page, 1), 9999), 9999);
    const limit = Math.min(Math.max((0, parseIntSafe_1.i)(req.query.limit, 20), 1), 100);
    const search = String(req.query.search ?? "").trim();
    const catSlug = String(req.query.category ?? "")
        .trim()
        .toLowerCase();
    const priceMin = num(req.query.priceMin);
    const priceMax = num(req.query.priceMax);
    /* 2️⃣ craft Prisma "where" clause -------------------------------------- */
    const where = {
        AND: [
            catSlug && { category: { slug: catSlug } },
            search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            },
            priceMin !== undefined && { price: { gte: priceMin } },
            priceMax !== undefined && { price: { lte: priceMax } },
        ].filter(Boolean),
    };
    try {
        /* 3️⃣ run count + paged query together (single round-trip) ----------- */
        const [total, items] = await prisma_1.default.$transaction([
            prisma_1.default.product.count({ where }),
            prisma_1.default.product.findMany({
                where,
                include: { images: true, colors: true, category: true },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        res.json({
            ok: true,
            data: items,
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
        res.status(500).json({ ok: false, error: "Failed to fetch products" });
        return;
    }
};
exports.getAllProducts = getAllProducts;
/* -------------------------------------------------------------------------- */
/* ✅ UPDATE PRODUCT  –  nested write + optimistic concurrency                */
/* -------------------------------------------------------------------------- */
const updateProduct = async (req, res) => {
    const { id } = req.params;
    /* 0️⃣ validate body */
    const parsed = userValidators_1.updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ ok: false, error: parsed.error.flatten() });
        return;
    }
    const clientVersion = parsed.data.version;
    const { name, slug, price, description, stock, categoryName, sizes, images = [], colors = [], } = parsed.data;
    try {
        /* 1️⃣ verify product still exists */
        const exists = await prisma_1.default.product.findUnique({
            where: { id },
            select: { version: true },
        });
        if (!exists) {
            res.status(404).json({ ok: false, error: "Product not found" });
            return;
        }
        /* 2️⃣ pre-flight version check */
        if (exists.version !== clientVersion) {
            res
                .status(409)
                .json({ ok: false, error: "Product changed, reload and try again." });
            return;
        }
        /* 3️⃣ upsert / connect category */
        const categorySlug = (0, slugify_1.default)(categoryName, { lower: true });
        const category = await prisma_1.default.category.upsert({
            where: { slug: categorySlug },
            create: { name: categoryName, slug: categorySlug },
            update: {},
            select: { id: true },
        });
        /* 4️⃣ gather ids present in payload (for deleteMany filters) */
        const imageIdsInPayload = images.filter((i) => i.id).map((i) => i.id);
        const colorIdsInPayload = colors.filter((c) => c.id).map((c) => c.id);
        /* 5️⃣ single nested update guarded by version and bumping it +1 */
        const product = await prisma_1.default.product.update({
            where: { id, version: clientVersion }, // ← guard
            data: {
                version: { increment: 1 }, // ← bump
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
                        const colImageIds = col.images?.filter((i) => i.id).map((i) => i.id) ?? [];
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
        res.json({ ok: true, data: product });
        return;
    }
    catch (err) {
        /* 6️⃣ graceful error handling */
        if (err instanceof library_1.PrismaClientKnownRequestError &&
            err.code === "P2002" &&
            Array.isArray(err.meta?.target) &&
            err.meta.target.includes("slug")) {
            res.status(409).json({ ok: false, error: "Slug already exists" });
            return;
        }
        if (err instanceof library_1.PrismaClientKnownRequestError && err.code === "P2025") {
            // Version no longer matches (another admin saved between steps 1 & 5)
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
/* ✅ DELETE PRODUCT                                                         */
/* -------------------------------------------------------------------------- */
const deleteProduct = async (req, res) => {
    try {
        await prisma_1.default.product.delete({ where: { id: req.params.id } });
        res.status(204).send();
        return;
    }
    catch (err) {
        console.error("Delete product failed:", err);
        res
            .status(500)
            .json({ ok: false, error: err.message ?? "Server error" });
        return;
    }
};
exports.deleteProduct = deleteProduct;
/* -------------------------------------------------------------------------- */
/* ✅ GET SINGLE PRODUCT                                                     */
/* -------------------------------------------------------------------------- */
const getProductById = async (req, res) => {
    try {
        const product = await prisma_1.default.product.findUnique({
            where: { id: req.params.id },
            include: {
                images: true,
                colors: { include: { images: true } },
                category: true,
            },
        });
        if (!product) {
            res.status(404).json({ ok: false, error: "Product not found" });
            return;
        }
        res.json({ ok: true, data: product });
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
