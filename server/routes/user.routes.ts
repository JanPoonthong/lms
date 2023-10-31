import express from "express";

import {
  activateUser,
  registrationUser,
  loginUser,
  logoutUser,
  updateAccessToken,
} from "../controllers/user.controller";

import { isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refreshtoken", updateAccessToken);

export default userRouter;
