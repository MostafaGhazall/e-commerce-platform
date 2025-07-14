"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const userValidators_1 = require("../../shared/userValidators");
const router = (0, express_1.Router)();
// ──────────────────────────────────────────────────────────
// GET profile
// ──────────────────────────────────────────────────────────
router.get("/profile", auth_1.authenticate, async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                birthday: true,
                gender: true,
                address: true,
                city: true,
                region: true,
                postalcode: true,
                country: true,
                phone: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        next(err);
    }
});
// ──────────────────────────────────────────────────────────
// PATCH profile (partial update)
// ──────────────────────────────────────────────────────────
router.patch("/profile", auth_1.authenticate, async (req, res, next) => {
    try {
        const parsed = userValidators_1.updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
        const updated = await prisma_1.default.user.update({
            where: { id: req.userId },
            data,
        });
        res.json({
            message: "Profile updated",
            user: {
                email: updated.email,
                firstName: updated.firstName,
                lastName: updated.lastName,
                birthday: updated.birthday,
                gender: updated.gender,
                address: updated.address,
                city: updated.city,
                region: updated.region,
                postalcode: updated.postalcode,
                country: updated.country,
                phone: updated.phone,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
