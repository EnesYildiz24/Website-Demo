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
  it("should update a review", async () => {
    const initial = await Review.create({
      reviewerId: new mongoose.Types.ObjectId(),
      reviewerName: "John Doe",
      rating: 2,
      comment: "Needs improvement",
    });

    const newComment = "Actually, it's better than I thought";
    const newRating = 4;
    const updated = await updateReview({
      id: initial._id.toString(),
      rating: newRating,
      comment: newComment,
    });

    expect(updated.id).toBe(initial._id.toString());
    expect(updated.rating).toBe(newRating);
    expect(updated.comment).toBe(newComment);
  });

  it("should delete a review", async () => {
    const reviewDoc = await Review.create({
      reviewerName: "Jane Doe",
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
