import { Router } from "express";
import prisma from "../prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// ✅ GET: Wishlist for logged-in user
router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findFirst({
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
  } catch (err) {
    next(err);
  }
});

// ✅ POST: Add product to wishlist
router.post("/", authenticate, async (req: AuthRequest, res) => {
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
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: req.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.userId! },
      });
    }

    // Check if product already exists
    const existing = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existing) {
      res.status(409).json({ message: "Already in wishlist" });
      return;
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    res.status(201).json(item);
    return;
  } catch (err: any) {
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
router.delete("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const productId = req.params.id;

    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: req.userId },
    });

    if (!wishlist) {
      res.status(404).json({ message: "Wishlist not found" });
      return;
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
