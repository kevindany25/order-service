import { PrismaClient, Order, OrderItem, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class OrderRepository {
  async createOrder(userId: string, total: number): Promise<Order> {
    return await prisma.order.create({
      data: {
        userId,
        total,
        status: OrderStatus.PENDING,
      },
    });
  }

  async addOrderItem(
    orderId: string,
    item: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      total: number;
    },
  ): Promise<OrderItem> {
    return await prisma.orderItem.create({
      data: {
        orderId,
        ...item,
      },
    });
  }

  async findOrderById(id: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
  }

  async findOrdersByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ orders: Order[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: { items: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),

      prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total };
  }

  async udpateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async findAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ): Promise<{ orders: Order[]; total: number }> {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }
}
