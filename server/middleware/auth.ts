import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import { redis } from "../utils/redis";

interface JwtPayload {
  id: string;
}

// Autheticated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return next(new ErrorHandler("Please login to access to resource", 400));
    }

    const decoded = (await jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string,
    )) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Access token not valid", 400));
    }

    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    req.user = JSON.parse(user);

    next();
  },
);