import { CartItemProps } from "../types/CartItem";
import { useTranslation } from "react-i18next";

export default function CartItem({
  name,
  image,
  price,
  quantity,
  size,
  color,
  colorName,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-md border shadow-sm bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
      {/* Left: Product image and info */}
      <div className="flex items-center gap-4">
        <img
          src={image}
          onError={(e) => (e.currentTarget.src = "/images/default-product.png")}
          alt={name}
          className="w-20 h-20 object-contain rounded"
        />
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-gray-500">
            {t("cartItem.price")}: EGP {price.toFixed(2)}
          </p>

          {size && (
            <p className="text-xs text-gray-500 mt-1">
              {t("cartItem.size")}: {size}
            </p>
          )}
          {color && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {t("cartItem.color")}:
              <span
                className="inline-block w-4 h-4 rounded-full border"
                style={{ backgroundColor: color }}
                title={colorName}
              ></span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Quantity controls and remove */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrease}
            className="px-2 py-1 border rounded text-sm cursor-pointer"
          >
            -
          </button>
          <span className="px-2 w-8 text-center">{quantity}</span>
          <button
            onClick={onIncrease}
            className="px-2 py-1 border rounded text-sm cursor-pointer"
          >
            +
          </button>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:underline cursor-pointer text-sm"
        >
          {t("cartItem.remove")}
        </button>
      </div>
    </div>
  );
}
