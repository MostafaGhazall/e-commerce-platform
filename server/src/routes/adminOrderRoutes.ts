import { Router } from "express";
import { authenticateAdmin } from "../middleware/adminAuth";
import { getAllOrders, getOrderById, updateOrderStatus } from "../controllers/adminOrderController";

const router = Router();

router.use(authenticateAdmin);

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;