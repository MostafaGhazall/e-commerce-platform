"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickVariantImage = pickVariantImage;
function pickVariantImage(item) {
    // 1️⃣ match by hex‐value first
    if (item.color) {
        const matchByValue = item.product.colors.find(c => c.value.toLowerCase() === item.color.toLowerCase());
        if (matchByValue?.images.length) {
            return matchByValue.images[0].url;
        }
    }
    // 2️⃣ then try human name
    if (item.colorName) {
        const matchByName = item.product.colors.find(c => c.name.toLowerCase() === item.colorName.toLowerCase());
        if (matchByName?.images.length) {
            return matchByName.images[0].url;
        }
    }
    // 3️⃣ fallback to first product image
    if (item.product.images.length) {
        return item.product.images[0].url;
    }
    // 4️⃣ ultimate fallback
    return "/fallback.png";
}
