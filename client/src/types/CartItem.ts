export interface CartItem {
  id: string;                    // cart item ID (from DB)
  productId: string;             // reference to Product.id
  name: string;                  // product name
  image: string;                 // main product image
  price: number;                 // current product price
  quantity: number;             // quantity in cart
  size?: string;                 // optional size variant
  color?: string;                // hex code or slug
  colorName?: string;           // readable color name
}

export interface CartItemProps extends CartItem {
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}