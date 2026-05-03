export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusDto {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  total: number;
  status: string;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemResponseDto {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}
