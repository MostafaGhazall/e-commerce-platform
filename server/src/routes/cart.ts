import { Router } from "express";
import prisma from "../prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * ✅ GET /cart
 * Fetches the authenticated user's cart with related product details.
 */
router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, colors: true },
            },
          },
        },
      },
    });

    res.json(cart || { items: [] });
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ POST /cart
 * Adds an item to the user's cart.
 * If an identical item (same productId, size, color) exists, increment its quantity.
 */
router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { productId, quantity, size, color, colorName } = req.body;

    if (!productId || typeof quantity !== "number" || quantity < 1) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Get or create cart for user
    let cart = await prisma.cart.findFirst({ where: { userId: req.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.userId! } });
    }

    // Look for an existing identical cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size,
        color,
      },
    });

    if (existingItem) {
      // Increment quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      res.json(updatedItem);
    } else {
      // Create new item
      const newItem = await prisma.cartItem.create({
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
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ PATCH /cart/:itemId
 * Updates the quantity of a specific cart item (only if it belongs to the user).
 */
router.patch("/:itemId", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const q = Number(req.body.quantity);
    if (Number.isNaN(q) || q < 1) {
      res.status(400).json({ message: "Invalid quantity" });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity: q },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ DELETE /cart/clear/all
 * Deletes all items in the current user's cart.
 */
router.delete("/clear/all", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId: req.userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ DELETE /cart/:itemId
 * Deletes a single cart item (only if it belongs to the user).
 */
router.delete("/:itemId", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
