"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuthController_1 = require("../controllers/adminAuthController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.post("/login", adminAuthController_1.adminLogin);
router.get("/me", adminAuth_1.authenticateAdmin, adminAuthController_1.adminMe);
exports.default = router;
