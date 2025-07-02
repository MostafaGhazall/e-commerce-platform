import { Router } from "express";
import { authLimiter } from "../utils/rateLimiter";
import { register, login, logout, me } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/logout",   logout);            
router.get ("/me",       authenticate, me);

export default router;
