"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// ✅ GET /api/admin/orders?status=shipped&email=user@example.com&paymentMethod=cash-on-delivery&from=2024-01-01&to=2024-12-31&page=1&pageSize=20
const getAllOrders = async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const status = req.query.status;
    const email = req.query.email;
    const paymentMethod = req.query.paymentMethod;
    const from = req.query.from;
    const to = req.query.to;
    const where = {};
    if (status)
        where.status = status;
    if (email)
        where.email = email;
    if (paymentMethod)
        where.paymentMethod = paymentMethod;
    if (from || to) {
        where.createdAt = {};
        if (from)
            where.createdAt.gte = new Date(from);
        if (to)
            where.createdAt.lte = new Date(to);
    }
    const [total, orders] = await Promise.all([
        prisma_1.default.order.count({ where }),
        prisma_1.default.order.findMany({
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
exports.getAllOrders = getAllOrders;
// ✅ Get one order by ID
const getOrderById = async (req, res) => {
    const { id } = req.params;
    const order = await prisma_1.default.order.findUnique({
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
exports.getOrderById = getOrderById;
// ✅ PATCH /api/admin/orders/:id/status  { status: "shipped" }
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
    }
    const order = await prisma_1.default.order.update({
        where: { id },
        data: { status },
    });
    res.json({ message: "Status updated", order });
};
exports.updateOrderStatus = updateOrderStatus;
