import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { authMiddleware } from "./middlewares/auth.middleware";
import { OrderService } from "./services/order.service";

const app = express();
const orderService = new OrderService();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/heath", (req, res) => {
  res
    .status(200)
    .json({
      status: "OK",
      service: "order-service",
      timestamp: new Date().toISOString(),
    });
});

app.post("/orders", authMiddleware, async (req: any, res) => {
  try {
    const order = await orderService.createOrder(req.user.userId, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get("/orders", authMiddleware, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const orders = await orderService.getUserOrders(
      req.user.userId,
      page,
      limit,
    );
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("orders/:id/status", authMiddleware, async (req: any, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user.role === "ADMIN",
    );
    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get("/admin/orders", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const orders = await orderService.getAllOrders(
      page,
      limit,
      req.query.status as any,
    );

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.listen(config.port, () => {
  console.log(`Order service running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
