export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string; // Optional if size variants exist
  color?: string;      // hex or slug for swatch
  colorName?: string;  // name for display
}

export interface CartItemProps extends CartItem {
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}