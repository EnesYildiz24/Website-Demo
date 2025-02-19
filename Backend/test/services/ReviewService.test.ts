// tests/ReviewService.test.ts
import mongoose from "mongoose";
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../../src/services/ReviewService";
import { Review } from "../../src/model/ReviewModel";

describe("Review Service Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
      autoIndex: true,
    });
  });
  afterEach(async () => {
    await Review.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should create a review", async () => {
    const reviewData = {
      reviewerId: new mongoose.Types.ObjectId().toString(),
      productId: new mongoose.Types.ObjectId().toString(),
      sellerId: new mongoose.Types.ObjectId().toString(),
      rating: 5,
      comment: "Excellent service",
    };

    const review = await createReview(reviewData);
    expect(review).toHaveProperty("id");
    expect(review.reviewerId).toBe(reviewData.reviewerId);
    expect(review.productId).toBe(reviewData.productId);
    expect(review.sellerId).toBe(reviewData.sellerId);
    expect(review.rating).toBe(5);
    expect(review.comment).toBe("Excellent service");
    expect(typeof review.createdAt).toBe("string");
  });

  it("should fetch all reviews", async () => {
    const rev1 = await createReview({
      reviewerId: new mongoose.Types.ObjectId().toString(),
      rating: 3,
      comment: "Okay product",
    });
    const rev2 = await createReview({
      reviewerId: new mongoose.Types.ObjectId().toString(),
      rating: 4,
      comment: "Pretty good",
    });

    const reviews = await getAllReviews();
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBe(2);
    expect(reviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: rev1.id }),
        expect.objectContaining({ id: rev2.id }),
      ])
    );
  });

  it("should update a review", async () => {
    const initial = await Review.create({
      reviewerId: new mongoose.Types.ObjectId(),
      rating: 2,
      comment: "Needs improvement",
    });

    const newComment = "Actually, it's better than I thought";
    const newRating = 4;
    const updated = await updateReview({
      id: initial._id.toString(),
      reviewerId: initial.reviewerId.toString(),
      rating: newRating,
      comment: newComment,
    });

    expect(updated.id).toBe(initial._id.toString());
    expect(updated.reviewerId).toBe(initial.reviewerId.toString());
    expect(updated.rating).toBe(newRating);
    expect(updated.comment).toBe(newComment);
  });

  it("should delete a review", async () => {
    const reviewDoc = await Review.create({
      reviewerId: new mongoose.Types.ObjectId(),
      rating: 3,
      comment: "Decent",
    });
    const deleted = await deleteReview(reviewDoc._id.toString());
    expect(deleted.id).toBe(reviewDoc._id.toString());
    expect(deleted.rating).toBe(3);
    expect(deleted.comment).toBe("Decent");
    const check = await Review.findById(reviewDoc._id);
    expect(check).toBeNull();
  });
});
