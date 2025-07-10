"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminProductController_1 = require("../controllers/adminProductController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.use(adminAuth_1.authenticateAdmin); // Protect all routes below
router.get("/", adminProductController_1.getAllProducts);
router.post("/", adminProductController_1.createProduct);
router.put("/:id", adminProductController_1.updateProduct);
router.delete("/:id", adminProductController_1.deleteProduct);
router.get("/:id", adminProductController_1.getProductById);
exports.default = router;
