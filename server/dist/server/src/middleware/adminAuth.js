"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("ADMIN_JWT_SECRET is missing");
const authenticateAdmin = (req, res, next) => {
    // 1️⃣  Prefer the cookie
    let token = req.cookies?.admin_token;
    // 2️⃣  Fallback to Authorization: Bearer <token>
    if (!token) {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith("Bearer ")) {
            token = auth.slice(7); // remove "Bearer "
        }
    }
    // 3️⃣  No token → 401
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token" });
        return;
    }
    // 4️⃣  Verify JWT
    try {
        const { adminId } = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.adminId = adminId;
        next();
    }
    catch {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
exports.authenticateAdmin = authenticateAdmin;
