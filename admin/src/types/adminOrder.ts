export interface AdminOrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  colorName?: string;
  imageUrl?: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AdminOrder {
  id: string;
  userId?: string;
  createdAt: string;   // ISO string
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  address: string;
  city: string;
  region: string;
  postalcode: string;
  country: string;
  email: string;
  name: string;
  phone: string;
  items: AdminOrderItem[];
}
