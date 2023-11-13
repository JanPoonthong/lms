import express from "express";

import {
  uploadCourse,
  editCourse,
  getSingleCourse,
} from "../controllers/course.controller";

import { isAuthenticated, authorizeRoles } from "../middleware/auth";

const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse,
);

courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse,
);

courseRouter.get("/get-course/:id", getSingleCourse);

export default courseRouter;
