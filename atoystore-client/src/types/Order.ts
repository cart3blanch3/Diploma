export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Paid = 2,
  Shipped = 3,
  Completed = 4,
  Cancelled = 5
}

export interface OrderItem {
  product: {
    id: string;
    title: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
}

export interface PaymentInfoDto {
  method: "Cash" | "YooKassa";
  isPaid: boolean;
}

export interface ShippingInfoDto {
  address: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  note: string;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  shipping: {
    address: string;
    city: string;
    country: string;
  };
  items: OrderItem[];
  payment: PaymentInfoDto; // Добавлено для поддержки онлайн-оплаты
}

export interface OrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderDto {
  userId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  items: OrderItemDto[];
  shipping: ShippingInfoDto;
  payment: PaymentInfoDto;
  note?: string;
}
