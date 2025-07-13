"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminCategoryController_1 = require("../controllers/adminCategoryController");
const router = (0, express_1.Router)();
router.get("/", adminCategoryController_1.listCategories);
exports.default = router;
