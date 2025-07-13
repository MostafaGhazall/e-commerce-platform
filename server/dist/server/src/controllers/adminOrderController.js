"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = void 0;
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../prisma"));
const orderStatus_1 = require("../utils/orderStatus");
const zod_1 = require("zod");
/* -------------------------------------------------------------------------- */
/* 🧩  Schemas                                                                */
/* -------------------------------------------------------------------------- */
const listQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(100).default(20),
    status: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    paymentMethod: zod_1.z.string().optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z
        .string()
        .refine((s) => [...orderStatus_1.ACTIVE_ORDER_STATES, ...orderStatus_1.RESTOCK_ORDER_STATES, "delivered"].includes(s), "Invalid status"),
});
/* -------------------------------------------------------------------------- */
/* ✅ GET  /api/admin/orders                                                  */
/* -------------------------------------------------------------------------- */
const getAllOrders = async (req, res) => {
    /* 1️⃣ validate & coerce query params */
    const parse = listQuerySchema.safeParse(req.query);
    if (!parse.success) {
        res.status(400).json({ ok: false, error: parse.error.flatten() });
        return;
    }
    const { page, pageSize, status, email, paymentMethod, from, to } = parse.data;
    /* 2️⃣ build “where” */
    const where = {
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
        const [total, orders] = await prisma_1.default.$transaction([
            prisma_1.default.order.count({ where }),
            prisma_1.default.order.findMany({
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
    }
    catch (err) {
        console.error("List orders failed:", err);
        res.status(500).json({ ok: false, error: "Server error" });
    }
};
exports.getAllOrders = getAllOrders;
/* -------------------------------------------------------------------------- */
/* ✅ GET  /api/admin/orders/:id                                              */
/* -------------------------------------------------------------------------- */
const getOrderById = async (req, res) => {
    try {
        const order = await prisma_1.default.order.findUnique({
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
    }
    catch (err) {
        console.error("Fetch order failed:", err);
        res.status(500).json({ ok: false, error: "Server error" });
    }
};
exports.getOrderById = getOrderById;
/* -------------------------------------------------------------------------- */
/* ✅ PATCH /api/admin/orders/:id/status                                      */
/* -------------------------------------------------------------------------- */
const updateOrderStatus = async (req, res, next) => {
    /* 1️⃣ validate body */
    const parse = updateStatusSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ ok: false, error: parse.error.flatten() });
        return;
    }
    const { status } = parse.data;
    try {
        await prisma_1.default.$transaction(async (tx) => {
            const current = await tx.order.findUnique({
                where: { id: req.params.id },
                include: { items: true },
            });
            if (!current) {
                throw new library_1.PrismaClientKnownRequestError("Order not found", {
                    code: "P2025",
                    clientVersion: "n/a",
                });
            }
            /* restock logic */
            const wasActive = orderStatus_1.ACTIVE_ORDER_STATES.includes(current.status);
            const willRestock = orderStatus_1.RESTOCK_ORDER_STATES.includes(status);
            if (wasActive && willRestock) {
                await Promise.all(current.items.map((item) => tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                })));
            }
            await tx.order.update({
                where: { id: req.params.id },
                data: { status },
            });
        });
        /* 204 No Content */
        res.status(204).end();
    }
    catch (err) {
        if (err instanceof library_1.PrismaClientKnownRequestError && err.code === "P2025") {
            res.status(404).json({ ok: false, error: "Order not found" });
            return;
        }
        console.error("Update order status failed:", err);
        next(err); // let the global handler format the 500
    }
};
exports.updateOrderStatus = updateOrderStatus;
