import mongoose, { Types } from "mongoose";
import { logger } from "../logger";
import { Review, ReviewDocument } from "../model/ReviewModel";
import { ReviewResource } from "../Resources";

export async function createReview(
  reviewResources: ReviewResource,
  user: { _id: string; username: string }
): Promise<ReviewResource> {
  try {
    const review = await Review.create({
      productId: reviewResources.productId
        ? new mongoose.Types.ObjectId(reviewResources.productId)
        : undefined,
        reviewerId: new mongoose.Types.ObjectId(user._id),
        reviewerName: user.username || "Unbekannter Nutzer",
        rating: reviewResources.rating,
      comment: reviewResources.comment,
    });
    return {
      id: review?._id.toString(),
      productId: reviewResources.productId?.toString(),
      reviewerId: reviewResources.reviewerId?.toString(),
      reviewerName: user.username,
      createdAt: review.createdAt?.toISOString(),
      rating: reviewResources.rating,
      comment: reviewResources.comment,
    };
  } catch (err) {
    logger.error("Review konnte nicht erstellt werden: " + err);
    throw new Error("Review created failed: " + err);
  }
}

export async function getReview(reviewId: string): Promise<ReviewResource> {
  if (!reviewId) {
    throw new Error("Review id is missing, can't get it");
  }
  try {
    const review = await Review.findById(reviewId).populate("reviewerId", "username");
    if (!review) {
      throw new Error(`Cannot find Review with id ${reviewId}`);
    }
    return {
      id: review._id.toString(),
      productId: review.productId?.toString(),
      reviewerId: review.reviewerId?.toString(),
      createdAt: review.createdAt?.toISOString(),
      rating: review.rating,
      comment: review.comment,
    };
  } catch (err) {
    throw new Error("Review not Found: " + err);
  }
}
export async function getAllReviews(): Promise<ReviewResource[]> {
  try {
    const reviews = await Review.find({}).exec();
    const reviewResources = reviews.map((review) => ({
      id: review._id.toString(),
      productId: review.productId?.toString(),
      sellerId: review.reviewerId?.toString(),
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
        productId: reviewResources.productId,
        sellerId: reviewResources.reviewerId,
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
      productId: review.productId?.toString(),
      reviewerId: review.reviewerId?.toString(),
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
    productId: review.productId?.toString(),
    reviewerId: review.reviewerId?.toString(),
    createdAt: review.createdAt!.toISOString(),
    rating: review.rating,
    comment: review.comment,
  };
}

export async function getReviewsByProductId(
  productId: string
): Promise<ReviewResource[]> {
  try {
    // Populiert das Feld reviewerId mit dem Benutzernamen
    const reviews = await Review.find({ productId }).populate("reviewerId", "username");
    const reviewResources = reviews.map((review) => ({
      id: review._id.toString(),
      productId: review.productId?.toString(),
      reviewerId: review.reviewerId && review.reviewerId instanceof Types.ObjectId
      ? review.reviewerId.toString()
      : (review.reviewerId as any)?._id?.toString() ?? "",
      reviewerName: review.reviewerName,
      createdAt: review.createdAt!.toISOString(),
      rating: review.rating,
      comment: review.comment,
    }));
     return reviewResources
    ;
  } catch (error) {
    logger.error(
      "Fehler beim Abrufen der Reviews für ein bestimmtes Produkt:",
      error
    );
    throw new Error(
      "Fehler beim Abrufen der Reviews für ein bestimmtes Produkt"
    );
  }
}

