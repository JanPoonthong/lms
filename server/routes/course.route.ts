import express from "express";

import {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourse,
    getCourseByUser,
    addQuestion,
    addAnswer,
    addReview,
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
courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);

courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourse);
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);

export default courseRouter;
