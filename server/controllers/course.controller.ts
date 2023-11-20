import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import { sendMail } from "../utils/sendMail";

import courseModel from "../models/course.model";
import { redis } from "../utils/redis";

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
            const courseId = req.params.id;

            const isCacheExist = await redis.get(courseId);

            // search redis for performance
            if (isCacheExist) {
                const course = JSON.parse(isCacheExist);
                res.status(200).json({
                    success: true,
                    course,
                });
            } else {
                const course = await courseModel
                    .findById(req.params.id)
                    .select(
                        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
                    );

                await redis.set(courseId, JSON.stringify(course));

                res.status(200).json({
                    success: true,
                    course,
                });
            }
        } catch (error: any) {}
    },
);

// get all course -- with purchasing
export const getAllCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isCacheExist = await redis.get("allCourses");

            // search redis for performance
            if (isCacheExist) {
                const course = JSON.parse(isCacheExist);
                res.status(200).json({
                    success: true,
                    course,
                });
            } else {
                const course = await courseModel
                    .find()
                    .select(
                        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
                    );

                await redis.set("allCourses", JSON.stringify(course));

                res.status(200).json({
                    success: true,
                    course,
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error, 500));
        }
    },
);

// get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCourseList = req.user?.courses;
            const courseId = req.params.id;

            const courseExist = userCourseList?.find(
                (course: any) => course._id.toString() === courseId,
            );

            if (!courseExist) {
                return next(
                    new ErrorHandler(
                        "Your are not eligible to access this course",
                        404,
                    ),
                );
            }

            const course = await courseModel.findById(courseId);
            const content = course?.courseData;

            res.status(200).json({
                success: true,
                content,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error, 500));
        }
    },
);

// add question in course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { question, courseId, contentId }: IAddQuestionData =
                req.body as IAddQuestionData;

            // Check if ID is valid, much be some bits
            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const course = await courseModel.findById(courseId);
            const courseContent = course?.courseData.find((item: any) =>
                item._id.equals(contentId),
            );

            if (!courseContent) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            // create a new question object
            const newQuestion: any = {
                user: req.user,
                question,
                questionReplis: [],
            };

            courseContent.questions.push(newQuestion);

            await course?.save();

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error, 500));
        }
    },
);

// add answer in course question
interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { answer, courseId, contentId, questionId }: IAddAnswerData =
                req.body as IAddAnswerData;

            if (!mongoose.Types.ObjectId.isValid(contentId)) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const course = await courseModel.findById(courseId);
            const courseContent = course?.courseData.find((item: any) =>
                item._id.equals(contentId),
            );

            if (!courseContent) {
                return next(new ErrorHandler("Invalid content id", 400));
            }

            const question = courseContent.questions?.find((item: any) =>
                item._id.equals(questionId),
            );

            if (!question) {
                return next(new ErrorHandler("Invalid question id", 400));
            }

            const newAnswer: any = {
                user: req.user,
                answer,
            };

            question.questionReplis.push(newAnswer);

            await course?.save();

            if (req.user?._id === question.user._id) {
                // create a notification model
            } else {
                const data = {
                    name: question.user.name,
                    title: courseContent.title,
                };

                const html = ejs.renderFile(
                    path.join(__dirname, "../mails/question-reply.ejs"),
                    data,
                );

                try {
                    await sendMail({
                        email: question.user.email,
                        subject: "Question Reply",
                        template: "question-reply.ejs",
                        data,
                    });
                } catch (error: any) {
                    return next(new ErrorHandler(error, 500));
                }
            }

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error, 500));
        }
    },
);

interface IAddReview {
    userId: string;
    rating: number;
    review: string;
}

export const addReview = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCourseList = req.user?.courses;
            const courseId = req.params.id;

            const courseExists = userCourseList?.some(
                (course: any) => course._id.toString() === courseId.toString(),
            );

            if (!courseExists) {
                return next(
                    new ErrorHandler(
                        "You not able eligible to access this course",
                        404,
                    ),
                );
            }

            const course = await courseModel.findById(courseId);

            const { rating, review }: IAddReview = req.body as IAddReview;

            // create new object for review
            const reviewData: any = {
                user: req.user,
                rating,
                comment: review,
            };

            course?.reviews?.push(reviewData);

            let avg = 0;
            course?.reviews.forEach((rev: any) => {
                avg += rev.rating;
            });

            if (course) {
                course.rating = avg / course?.reviews.length;
            }

            await course?.save();

            const notification = {
                title: "New review has been made on your course",
                message: `${req.user?.name} has given a review in ${course.name}`,
            };

            // create a notification

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error, 500).stack);
        }
    },
);

// add reply in review
interface IAddReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
}
export const addReplyToReview = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { comment, courseId, reviewId }: IAddReviewData =
                req.body as IAddReviewData;

            const course = await courseModel.findById(courseId);

            if (!course) {
                return next(
                    new ErrorHandler(
                        "You not able eligible to access this course",
                        404,
                    ),
                );
            }

            const review = course?.reviews?.find(
                (rev: any) => rev._id.toString() === reviewId.toString(),
            );

            if (!review) {
                return next(new ErrorHandler("Review not found", 404));
            }

            const replyData: any = {
                user: req.user,
                comment,
            };

            if (!review.commentReplies) {
                review.commentReplies = [];
            }

            review?.commentReplies.push(replyData);

            await course?.save();

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error, 500).stack);
        }
    },
);
