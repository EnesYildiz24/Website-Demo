import { Schema, model, Model } from "mongoose";

export interface IReview {
  reviewerId: Schema.Types.ObjectId;
  productId?: Schema.Types.ObjectId;
  sellerId?: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export type ReviewModel = Model<IReview>;

const reviewSchema = new Schema<IReview>(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Review = model<IReview, ReviewModel>("Review", reviewSchema);
