import { model, Schema } from "mongoose";

interface IComment {
  user: object;
  comment: string;
}

interface IReview {
  user: object;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

interface ILink {
  title: string;
  url: string;
}

interface ICourseData {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IComment[];
}

interface ICourse {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number
  thumbnail: object
  tags: string
  level: string
  demoUrl: string
  benefits: {title: string}[] 
  prerequisites: {title: string}[] 
  reviews: IReview[]
  courseData: ICourseData[]
  rating?: number
  purchased?: number
}
