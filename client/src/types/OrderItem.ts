export interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  colorName?: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  total: number;
  shipping: {
    name: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    city: string;
    region: string;
    postalCode: string;
  };
  items: OrderItem[];
}
