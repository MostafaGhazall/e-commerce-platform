"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const userValidators_1 = require("../../../shared/userValidators");
const JWT_SECRET = process.env.JWT_SECRET;
// helper to create & send cookie + safe user object
function issueCookie(res, user) {
    const prod = process.env.NODE_ENV === "production";
    const token = jsonwebtoken_1.default.sign({ userId: user.id, tokenVersion: user.tokenVersion }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: prod, // only secure in production
        sameSite: prod ? "none" : "lax", // ❗ use "none" for cross-site cookie in production (Vercel → Render, etc)
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
// ──────────────────────────────────────────────────────────
//   REGISTER  – auto-login on success
// ──────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const parsed = userValidators_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const { firstName, lastName, email, password } = parsed.data;
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: "Email already in use" });
            return;
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma_1.default.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                email,
                password: hashed,
            },
        });
        issueCookie(res, newUser);
        res.status(201).json({
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName,
                lastName,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// ──────────────────────────────────────────────────────────
//   LOGIN
// ──────────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const parsed = userValidators_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const { email, password } = parsed.data;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                password: true,
                tokenVersion: true,
            },
        });
        // unify “user not found” and “bad password” → 401
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        issueCookie(res, user);
        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// ──────────────────────────────────────────────────────────
const logout = (_req, res) => {
    const prod = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: prod,
        sameSite: prod ? "none" : "lax",
    });
    res.json({ message: "Logged out" });
};
exports.logout = logout;
const me = async (req, res, next) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, firstName: true, lastName: true },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
};
exports.me = me;
