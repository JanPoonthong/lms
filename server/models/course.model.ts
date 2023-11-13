import { model, Schema, Model } from "mongoose";

interface IComment {
  user: object;
  comment: string;
  commentReplies?: IComment[];
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
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  rating?: number;
  purchased?: number;
}

const reviewSchema: Schema<IReview> = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});

const linkSchema: Schema<ILink> = new Schema<ILink>({
  title: String,
  url: String,
});

const commentSchema: Schema<IComment> = new Schema<IComment>({
  user: Object,
  comment: String,
  commentReplies: [Object],
});

const courseDataSchema: Schema<ICourseData> = new Schema<ICourseData>({
  title: String,
  description: String,
  videoUrl: String,
  videoThumbnail: Object,
  videoSection: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});

const courseSchema: Schema<ICourse> = new Schema<ICourse>({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  estimatedPrice: {
    type: Number,
  },
  thumbnail: {
    public_id: {
      type: String,
      require: true,
    },
    url: {
      type: String,
      require: true,
    },
  },
  tags: {
    type: String,
    require: true,
  },
  level: {
    type: String,
    require: true,
  },
  demoUrl: {
    type: String,
    require: true,
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  rating: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
});

const courseModel: Model<ICourse> = model<ICourse>("Course", courseSchema);

export default courseModel;
