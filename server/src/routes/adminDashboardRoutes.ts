import { Router } from "express";
import { getDashboardStats } from "../controllers/adminDashboardController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();

router.get("/dashboard", authenticateAdmin, getDashboardStats);

export default router;
