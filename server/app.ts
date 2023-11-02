require("dotenv").config();

import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes";
import { ErrorMiddleware } from "./middleware/error";

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// route
app.use("/api/v1", userRouter);

app.use(ErrorMiddleware);

// cors -> cross origin resource sharing
app.use(
  cors({
    origin: process.env.ORGIN,
  }),
);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// unknow route
app.use("*", (req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

