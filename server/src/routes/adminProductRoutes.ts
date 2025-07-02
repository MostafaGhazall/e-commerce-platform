import { Router } from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/adminProductController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();

router.use(authenticateAdmin); // Protect all routes below

router.get("/", getAllProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getProductById);

export default router;
