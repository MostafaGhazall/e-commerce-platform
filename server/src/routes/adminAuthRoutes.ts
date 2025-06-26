import { Router } from "express";
import { adminLogin, adminMe } from "../controllers/adminAuthController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();

router.post("/login", adminLogin);
router.get("/me", authenticateAdmin, adminMe);

export default router;
