import express from "express";

import {
  activateUser,
  registrationUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  soicalAuth,
  updateUserInfo,
  updatePassword,
    updateProfilePicture,
} from "../controllers/user.controller";

import { isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.post("/soical-auth", soicalAuth);

userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password", isAuthenticated, updatePassword);
userRouter.put("/update-user-avatar", isAuthenticated, updateProfilePicture);

userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refresh-token", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);

export default userRouter;
