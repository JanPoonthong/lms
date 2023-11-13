import express from "express";

import {
  uploadCourse,
  editCourse,
  getSingleCourse,
  getAllCourse,
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
courseRouter.get("/get-courses", getAllCourse);

export default courseRouter;
