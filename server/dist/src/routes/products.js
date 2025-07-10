"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// ✅ GET all (or filtered) products
router.get("/", async (req, res, next) => {
    try {
        const { category } = req.query; // ⬅️ read ?category=footwear
        const products = await prisma_1.default.product.findMany({
            where: category
                ? {
                    category: {
                        slug: String(category), // ⬅️ relational filter
                    },
                }
                : undefined, // ⬅️ no filter → all products
            include: {
                images: true,
                reviews: true,
                colors: {
                    include: { images: true },
                },
                category: true, // ⬅️ so the client sees the name/slug
            },
        });
        res.json(products);
    }
    catch (err) {
        next(err);
    }
});
// ✅ GET single product by ID
router.get("/:id", async (req, res, next) => {
    try {
        const product = await prisma_1.default.product.findUnique({
            where: { id: req.params.id },
            include: {
                images: true,
                reviews: true,
                colors: {
                    include: { images: true }
                },
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json(product);
    }
    catch (err) {
        next(err);
    }
});
// ✅ POST a review to a specific product
router.post("/:id/reviews", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { comment, name, rating, date } = req.body;
        if (!comment || !name || typeof rating !== "number" || !date) {
            res.status(400).json({ message: "Invalid review data" });
            return;
        }
        const review = await prisma_1.default.review.create({
            data: {
                comment,
                name,
                rating,
                date: new Date(date),
                product: { connect: { id } },
            },
        });
        const updatedReviews = await prisma_1.default.review.findMany({
            where: { productId: id },
        });
        const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length;
        await prisma_1.default.product.update({
            where: { id },
            data: { rating: avgRating },
        });
        res.status(201).json(review);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
