"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ✅ GET: Wishlist for logged-in user
router.get("/", auth_1.authenticate, async (req, res, next) => {
    try {
        const wishlist = await prisma_1.default.wishlist.findFirst({
            where: { userId: req.userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                description: true,
                                stock: true,
                                rating: true,
                                category: true,
                                sizes: true,
                                images: {
                                    select: {
                                        id: true,
                                        url: true,
                                    },
                                },
                                colors: {
                                    select: {
                                        id: true,
                                        name: true,
                                        value: true,
                                        images: true,
                                    },
                                },
                                reviews: {
                                    select: {
                                        id: true,
                                        comment: true,
                                        name: true,
                                        rating: true,
                                        date: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.json(wishlist?.items.map((i) => i.product) || []);
    }
    catch (err) {
        next(err);
    }
});
// ✅ POST: Add product to wishlist
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { productId } = req.body;
        console.log("➡️ Add to wishlist:");
        console.log("   User ID:", req.userId);
        console.log("   Product ID:", productId);
        if (!productId) {
            res.status(400).json({ message: "Missing productId" });
            return;
        }
        // Get or create wishlist
        let wishlist = await prisma_1.default.wishlist.findFirst({
            where: { userId: req.userId },
        });
        if (!wishlist) {
            wishlist = await prisma_1.default.wishlist.create({
                data: { userId: req.userId },
            });
        }
        // Check if product already exists
        const existing = await prisma_1.default.wishlistItem.findFirst({
            where: { wishlistId: wishlist.id, productId },
        });
        if (existing) {
            res.status(409).json({ message: "Already in wishlist" });
            return;
        }
        const item = await prisma_1.default.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId,
            },
        });
        res.status(201).json(item);
        return;
    }
    catch (err) {
        console.error("❌ Wishlist Add Error:", err);
        res.status(500).json({
            message: "Server error",
            error: err.message || "Unknown error",
            details: err,
        });
        return;
    }
});
// ✅ DELETE: Remove product from wishlist
router.delete("/:id", auth_1.authenticate, async (req, res, next) => {
    try {
        const productId = req.params.id;
        const wishlist = await prisma_1.default.wishlist.findFirst({
            where: { userId: req.userId },
        });
        if (!wishlist) {
            res.status(404).json({ message: "Wishlist not found" });
            return;
        }
        await prisma_1.default.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId,
            },
        });
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
