import { OrderRepository } from "../repositories/order.repository";
import { CreateOrderDto } from "../dto/order.dto";
import axios from "axios";
import { OrderStatus } from "@prisma/client";
import { config } from "../config";

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class OrderService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const productInfos: ProductInfo[] = [];
    let total = 0;

    for (const item of createOrderDto.items) {
      try {
        const response = await axios.get(
          `${config.services.product}/products/${item.productId}`,
        );

        const product = response.data.data;

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        productInfos.push({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
        });

        total += product.price * item.quantity;
      } catch (error) {
        throw new Error(`Product not found: ${item.productId}`);
      }
    }

    const order = await this.orderRepository.createOrder(userId, total);

    for (let i = 0; i < createOrderDto.items.length; i++) {
      const item = createOrderDto.items[i];
      const productInfo = productInfos[i];

      await this.orderRepository.addOrderItem(order.id, {
        productId: item.productId,
        name: productInfo.name,
        price: productInfo.price,
        quantity: item.quantity,
        total: productInfo.price * item.quantity,
      });

      await axios
        .post(
          `${config.services.product}/products/${item.productId}/reserve-stock`,
          { quantity: item.quantity },
          {
            headers: {
              "internal-api-key": "your-internal-api-key",
            },
          },
        )
        .catch((error) => {
          console.error("Error reserving stock:", error);
        });
    }

    return await this.orderRepository.findOrderById(order.id);
  }

  async getOrderById(
    orderId: string,
    userId: string,
    isAdmin: boolean = false,
  ) {
    const order = await this.orderRepository.findOrderById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId && !isAdmin) {
      throw new Error("Unauthorized to view this order");
    }

    return order;
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    return await this.orderRepository.findOrdersByUser(userId, page, limit);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    isAdmin: boolean = false,
  ) {
    if (!isAdmin) {
      throw new Error("Only admins can update order status");
    }

    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    return await this.orderRepository.udpateOrderStatus(orderId, status);
  }

  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ) {
    return await this.orderRepository.findAllOrders(page, limit, status);
  }
}
