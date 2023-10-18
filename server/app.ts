require("dotenv").config();

import express, {NextFunction, Request, Response} from "express";
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

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
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});
