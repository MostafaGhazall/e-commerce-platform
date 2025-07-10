import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../prisma";
import {
  ACTIVE_ORDER_STATES,
  RESTOCK_ORDER_STATES,
} from "../utils/orderStatus";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* 🧩  Schemas                                                                */
/* -------------------------------------------------------------------------- */

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  email: z.string().email().optional(),
  paymentMethod: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const updateStatusSchema = z.object({
  status: z
    .string()
    .refine(
      (s) =>
        [...ACTIVE_ORDER_STATES, ...RESTOCK_ORDER_STATES, "delivered"].includes(
          s as any
        ),
      "Invalid status"
    ),
});

/* -------------------------------------------------------------------------- */
/* ✅ GET  /api/admin/orders                                                  */
/* -------------------------------------------------------------------------- */
export const getAllOrders = async (req: Request, res: Response) => {
  /* 1️⃣ validate & coerce query params */
  const parse = listQuerySchema.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ ok: false, error: parse.error.flatten() });
    return;
  }
  const { page, pageSize, status, email, paymentMethod, from, to } = parse.data;

  /* 2️⃣ build “where” */
  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(email && { email }),
    ...(paymentMethod && { paymentMethod }),
    ...(from || to
      ? {
          createdAt: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        }
      : {}),
  };

  try {
    /* 3️⃣ run count + page query together */
    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              size: true,
              color: true,
              colorName: true,
              imageUrl: true,
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      ok: true,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      data: Array.isArray(orders) ? orders : [],
    });
  } catch (err) {
    console.error("List orders failed:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ GET  /api/admin/orders/:id                                              */
/* -------------------------------------------------------------------------- */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            size: true,
            color: true,
            colorName: true,
            imageUrl: true,
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ ok: false, error: "Order not found" });
      return;
    }

    res.json({ ok: true, data: order });
  } catch (err) {
    console.error("Fetch order failed:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ PATCH /api/admin/orders/:id/status                                      */
/* -------------------------------------------------------------------------- */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /* 1️⃣ validate body */
  const parse = updateStatusSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ ok: false, error: parse.error.flatten() });
    return;
  }
  const { status } = parse.data;

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });
      if (!current) {
        throw new PrismaClientKnownRequestError("Order not found", {
          code: "P2025",
          clientVersion: "n/a",
        });
      }

      /* restock logic */
      const wasActive = ACTIVE_ORDER_STATES.includes(current.status as any);
      const willRestock = RESTOCK_ORDER_STATES.includes(status as any);

      if (wasActive && willRestock) {
        await Promise.all(
          current.items.map((item) =>
            tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          )
        );
      }

      await tx.order.update({
        where: { id: req.params.id },
        data: { status },
      });
    });

    /* 204 No Content */
    res.status(204).end();
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ ok: false, error: "Order not found" });
      return;
    }
    console.error("Update order status failed:", err);
    next(err); // let the global handler format the 500
  }
};
