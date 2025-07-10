"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * ✅ GET /cart
 * Fetches the authenticated user's cart with related product details.
 */
router.get("/", auth_1.authenticate, async (req, res, next) => {
    try {
        const cart = await prisma_1.default.cart.findFirst({
            where: { userId: req.userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                colors: {
                                    include: { images: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.json(cart || { items: [] });
    }
    catch (err) {
        next(err);
    }
});
/**
 * ✅ POST /cart
 * Adds an item to the user's cart.
 * If an identical item (same productId, size, color) exists, increment its quantity.
 */
router.post("/", auth_1.authenticate, async (req, res, next) => {
    try {
        const { productId, quantity, size, color, colorName } = req.body;
        if (!productId || typeof quantity !== "number" || quantity < 1) {
            res.status(400).json({ message: "Invalid input" });
            return;
        }
        // Check if product exists
        const product = await prisma_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Get or create cart for user
        let cart = await prisma_1.default.cart.findFirst({ where: { userId: req.userId } });
        if (!cart) {
            cart = await prisma_1.default.cart.create({ data: { userId: req.userId } });
        }
        // Look for an existing identical cart item
        const existingItem = await prisma_1.default.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                size,
                color,
            },
        });
        if (existingItem) {
            // Increment quantity
            const updatedItem = await prisma_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
            res.json(updatedItem);
        }
        else {
            // Create new item
            const newItem = await prisma_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    size,
                    color,
                    colorName,
                },
            });
            res.status(201).json(newItem);
        }
    }
    catch (err) {
        next(err);
    }
});
/**
 * ✅ PATCH /cart/:itemId
 * Updates the quantity of a specific cart item (only if it belongs to the user).
 */
router.patch("/:itemId", auth_1.authenticate, async (req, res, next) => {
    try {
        const q = Number(req.body.quantity);
        if (Number.isNaN(q) || q < 1) {
            res.status(400).json({ message: "Invalid quantity" });
            return;
        }
        const item = await prisma_1.default.cartItem.findUnique({
            where: { id: req.params.itemId },
            include: { cart: true },
        });
        if (!item || item.cart.userId !== req.userId) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        const updated = await prisma_1.default.cartItem.update({
            where: { id: req.params.itemId },
            data: { quantity: q },
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
/**
 * ✅ DELETE /cart/clear/all
 * Deletes all items in the current user's cart.
 */
router.delete("/clear/all", auth_1.authenticate, async (req, res, next) => {
    try {
        const cart = await prisma_1.default.cart.findFirst({
            where: { userId: req.userId },
        });
        if (cart) {
            await prisma_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
/**
 * ✅ DELETE /cart/:itemId
 * Deletes a single cart item (only if it belongs to the user).
 */
router.delete("/:itemId", auth_1.authenticate, async (req, res, next) => {
    try {
        const item = await prisma_1.default.cartItem.findUnique({
            where: { id: req.params.itemId },
            include: { cart: true },
        });
        if (!item || item.cart.userId !== req.userId) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        await prisma_1.default.cartItem.delete({ where: { id: req.params.itemId } });
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
