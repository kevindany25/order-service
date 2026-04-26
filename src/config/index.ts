import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3003,
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL!,
  },

  services: {
    auth: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    product: process.env.PRODUCT_SERVICE_URL || "http:/localhost:3002",
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
  },
};
