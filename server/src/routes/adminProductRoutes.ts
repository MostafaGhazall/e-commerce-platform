import { Router } from "express";
import {
  getAllProducts,
  createProduct,
  deleteProduct,
} from "../controllers/adminProductController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();

router.use(authenticateAdmin); // Protect all routes below

router.get("/", getAllProducts);
router.post("/", createProduct);
router.delete("/:id", deleteProduct);

export default router;
