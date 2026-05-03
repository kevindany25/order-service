import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { config } from "../config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const response = await axios.post(
      `${config.services.auth}/auth/verify`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.data.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = response.data.data;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
