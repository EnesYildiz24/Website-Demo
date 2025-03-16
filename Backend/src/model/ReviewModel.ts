import { Schema, model, Model, Document, Types } from "mongoose";

export interface IReview {
  productId?: Schema.Types.ObjectId;
  reviewerId?: Schema.Types.ObjectId;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface ReviewDocument extends IReview, Document {
  _id: Types.ObjectId; 
}

export type ReviewModel = Model<ReviewDocument>;

const reviewSchema = new Schema<ReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User" },
    reviewerName: { type: String, required: true }, 
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Review = model<ReviewDocument, ReviewModel>("Review", reviewSchema);
