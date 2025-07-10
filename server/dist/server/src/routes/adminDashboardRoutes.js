"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminDashboardController_1 = require("../controllers/adminDashboardController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
router.get("/dashboard", adminAuth_1.authenticateAdmin, adminDashboardController_1.getDashboardStats);
exports.default = router;
