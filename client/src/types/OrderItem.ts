export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;        // HEX or color value for UI
  colorName?: string;    // Human-readable color label
  image?: string;        // Product image URL
}
