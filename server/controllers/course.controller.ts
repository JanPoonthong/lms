import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services";

import courseModel from "../models/course.model";

// upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  },
);

// edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const courseId = req.params.id;
      console.log(courseId);

      const course = await courseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true },
      );

      console.log(course);

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 500).stack);
    }
  },
);

// get single course -- without purchasing

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await courseModel
        .findById(req.params.id)
        .select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
        );
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {}
  },
);

// get all course -- with purchasing
export const getAllCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await courseModel
        .find()
        .select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
        );

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  },
);
