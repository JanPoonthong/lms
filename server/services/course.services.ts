import { Response } from "express";
import courseModel from "../models/course.model";

import { CatchAsyncError } from "../middleware/catchAsyncError";

export const createCourse = CatchAsyncError(
    async (data: any, res: Response) => {
        const course = await courseModel.create(data);
        res.status(201).json({
            success: true,
            course,
        });
    },
);
