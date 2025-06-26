import { Request, Response } from "express";
import prisma from "../prisma";

// ✅ GET /api/admin/orders?status=shipped&email=user@example.com&paymentMethod=cash-on-delivery&from=2024-01-01&to=2024-12-31&page=1&pageSize=20
export const getAllOrders = async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const status = req.query.status as string | undefined;
  const email = req.query.email as string | undefined;
  const paymentMethod = req.query.paymentMethod as string | undefined;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  const where: any = {};

  if (status) where.status = status;
  if (email) where.email = email;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({ total, page, pageSize, orders });
};

// ✅ Get one order by ID
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json(order);
};

// ✅ PATCH /api/admin/orders/:id/status  { status: "shipped" }
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  res.json({ message: "Status updated", order });
};
