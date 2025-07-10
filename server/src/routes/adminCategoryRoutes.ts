import { Router } from "express";
import { listCategories } from "../controllers/adminCategoryController";

const router = Router();

router.get("/", listCategories);       

export default router;
