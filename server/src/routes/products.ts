import { Router, Request, Response, NextFunction } from "express";
import prisma from "../prisma";

const router = Router();

// ✅ GET all products
router.get("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        colors: true,
        reviews: true,
      },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// ✅ GET single product by ID
router.get("/:id", async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true, colors: true, reviews: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// ✅ POST a review to a specific product
router.post("/:id/reviews", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment, name, rating, date } = req.body;

    if (!comment || !name || typeof rating !== "number" || !date) {
      res.status(400).json({ message: "Invalid review data" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        comment,
        name,
        rating,
        date: new Date(date),
        product: { connect: { id } },
      },
    });

    const updatedReviews = await prisma.review.findMany({
      where: { productId: id },
    });

    const avgRating =
      updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

    await prisma.product.update({
      where: { id },
      data: { rating: avgRating },
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

export default router;
