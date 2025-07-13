"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/* GET /api/categories?withCounts=1&nonEmpty=1 */
const listCategories = async (req, res) => {
    const wantCounts = req.query.withCounts === "1";
    const onlyNonEmpty = req.query.nonEmpty === "1";
    /* ------------ DB query ---------------- */
    const cats = await prisma_1.default.category.findMany({
        orderBy: { slug: "asc" },
        /* ① if counts requested, include the relation count */
        ...(wantCounts && {
            include: { _count: { select: { products: true } } },
        }),
        /* ② if empty cats should be filtered out */
        ...(onlyNonEmpty && {
            where: { products: { some: {} } }, // “some” = at least one product
        }),
        /* ③ always select the common fields */
        select: {
            id: true,
            slug: true,
            names: true,
            ...(wantCounts && { _count: true }),
        },
    });
    /* ------------ shape response ---------------- */
    const shaped = cats.map((c) => wantCounts
        ? {
            id: c.id,
            slug: c.slug,
            names: c.names,
            count: c._count.products, // safe thanks to wantCounts
        }
        : {
            id: c.id,
            slug: c.slug,
            names: c.names,
        });
    res.json(shaped);
};
exports.listCategories = listCategories;
