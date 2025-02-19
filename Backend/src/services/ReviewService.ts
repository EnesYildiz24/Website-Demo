import mongoose from "mongoose";
import { logger } from "../logger";
import { Review } from "../model/ReviewModel";
import { ReviewResource } from "../Resources";

export async function createReview(
  reviewResources: ReviewResource
): Promise<ReviewResource> {
  try {
    const review = await Review.create({
      reviewerId: new mongoose.Types.ObjectId(reviewResources.reviewerId),
      productId: reviewResources.productId
        ? new mongoose.Types.ObjectId(reviewResources.productId)
        : undefined,
      sellerId: reviewResources.sellerId
        ? new mongoose.Types.ObjectId(reviewResources.sellerId)
        : undefined,
      rating: reviewResources.rating,
      comment: reviewResources.comment,
    });
    return {
      id: review?._id.toString(),
      reviewerId: reviewResources.reviewerId.toString(),
      productId: reviewResources.productId?.toString(),
      sellerId: reviewResources.sellerId?.toString(),
      createdAt: review.createdAt?.toISOString(),
      rating: reviewResources.rating,
      comment: reviewResources.comment,
    };
  } catch (err) {
    logger.error("Review konnte nicht erstellt werden: " + err);
    throw new Error("Review created failed: " + err);
  }
}

export async function getAllReviews(): Promise<ReviewResource[]> {
  try {
    const reviews = await Review.find({}).exec();
    const reviewResources = reviews.map((review) => ({
      id: review._id.toString(),
      reviewerId: review.reviewerId.toString(),
      productId: review.productId?.toString(),
      sellerId: review.sellerId?.toString(),
      createdAt: review.createdAt!.toISOString(),
      rating: review.rating,
      comment: review.comment,
    }));
    return reviewResources;
  } catch (err) {
    throw new Error("Error fetching Review: " + err);
  }
}

export async function updateReview(
  reviewResources: ReviewResource
): Promise<ReviewResource> {
  if (!reviewResources.id) {
    throw new Error("Review id is missing, cant update it");
  }
  try {
    const review = await Review.findOneAndUpdate(
      { _id: reviewResources.id },
      {
        reviewerId: reviewResources.reviewerId,
        productId: reviewResources.productId,
        sellerId: reviewResources.sellerId,
        rating: reviewResources.rating,
        comment: reviewResources.comment,
      },
      { new: true }
    );
    if (!review) {
      throw new Error(`cant update the Review ${reviewResources.id}`);
    }
    return {
      id: review._id.toString(),
      reviewerId: review.reviewerId.toString(),
      productId: review.productId?.toString(),
      sellerId: review.sellerId?.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt?.toISOString(),
    };
  } catch (err) {
    throw new Error("update Review fehlgeschlagen: " + err);
  }
}

export async function deleteReview(reviewId: string): Promise<ReviewResource> {
  if (!reviewId) {
    throw new Error("Review id is missing, can't delete it");
  }

  const review = await Review.findByIdAndDelete(reviewId);

  if (!review) {
    throw new Error(`Can't delete the order with Id ${reviewId}`);
  }

  return {
    id: review._id.toString(),
    reviewerId: review.reviewerId.toString(),
    productId: review.productId?.toString(),
    sellerId: review.sellerId?.toString(),
    createdAt: review.createdAt!.toISOString(),
    rating: review.rating,
    comment: review.comment,
  };
}
