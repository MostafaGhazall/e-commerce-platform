"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../src/prisma"));
async function main() {
    const hashed = await bcrypt_1.default.hash("admin123", 10);
    const admin = await prisma_1.default.admin.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@example.com",
            password: hashed,
        },
    });
    console.log("✅ Admin created:", admin);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
