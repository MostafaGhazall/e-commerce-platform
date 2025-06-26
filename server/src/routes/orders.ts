import { Router } from "express";
import prisma from "../prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// ✅ Create order from current cart
router.post(
  "/",
  authenticate,
  async (req: AuthRequest, res, next): Promise<void> => {
    try {
      const userId = req.userId!;
      const { shipping, total } = req.body;

      if (!shipping || typeof total !== "number") {
        res.status(400).json({ message: "Missing shipping data or total" });
        return;
      }

      // 1️⃣ Load cart with product images + colors
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  colors: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: "Cart is empty" });
        return;
      }

      // 2️⃣ Create order + snapshot variant data, all in one transaction
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId,
            total,
            status: "pending",
            paymentMethod: shipping.paymentMethod || "cash-on-delivery",
            name: shipping.name,
            email: shipping.email,
            address: shipping.address,
            city: shipping.city,
            region: shipping.region,
            postalCode: shipping.postalCode,
            country: shipping.country,
            phone: shipping.phone,
            items: {
              create: cart.items.map((item) => {
                // pick color-specific image or fallback
                const variantImageUrl =
                  item.product.colors.find((c) => c.name === item.colorName)
                    ?.images?.[0] ||
                  item.product.images[0]?.url ||
                  "/fallback.png";

                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.product.price,
                  size: item.size,
                  color: item.color,
                  colorName: item.colorName,
                  imageUrl: variantImageUrl,
                };
              }),
            },
          },
          include: { items: true },
        });

        // clear out the cart
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return created;
      });

      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }
);

// ✅ Get all orders for current user
router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      orders.map((order) => ({
        id: order.id,
        total: order.total,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        status: order.status,

        // ✅ Here we explicitly pick the snapshot fields
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
          colorName: item.colorName,
          imageUrl: item.imageUrl, // ← snapshot field
          product: item.product, // { id, name, slug }
        })),

        shipping: {
          name: order.name,
          email: order.email,
          phone: order.phone,
          address: order.address,
          city: order.city,
          region: order.region,
          postalCode: order.postalCode,
          country: order.country,
        },
      }))
    );
  } catch (err) {
    next(err);
  }
});

// ✅ Get single order by ID
router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json({
      id: order.id,
      total: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      status: order.status,

      // ✅ Explicitly include snapshot fields here too
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        colorName: item.colorName,
        imageUrl: item.imageUrl,
        product: item.product,
      })),

      shipping: {
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        region: order.region,
        postalCode: order.postalCode,
        country: order.country,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
