"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewService_1 = require("../../src/services/ReviewService");
const ReviewModel_1 = require("../../src/model/ReviewModel");
describe("Review Service Tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect("mongodb://127.0.0.1:27017/testdb", {
            autoIndex: true,
        });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ReviewModel_1.Review.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it("should create a review", () => __awaiter(void 0, void 0, void 0, function* () {
        const reviewData = {
            reviewerId: new mongoose_1.default.Types.ObjectId().toString(),
            productId: new mongoose_1.default.Types.ObjectId().toString(),
            sellerId: new mongoose_1.default.Types.ObjectId().toString(),
            rating: 5,
            comment: "Excellent service",
        };
        const review = yield (0, ReviewService_1.createReview)(reviewData);
        expect(review).toHaveProperty("id");
        expect(review.reviewerId).toBe(reviewData.reviewerId);
        expect(review.productId).toBe(reviewData.productId);
        expect(review.sellerId).toBe(reviewData.sellerId);
        expect(review.rating).toBe(5);
        expect(review.comment).toBe("Excellent service");
        expect(typeof review.createdAt).toBe("string");
    }));
    it("should fetch all reviews", () => __awaiter(void 0, void 0, void 0, function* () {
        const rev1 = yield (0, ReviewService_1.createReview)({
            reviewerId: new mongoose_1.default.Types.ObjectId().toString(),
            rating: 3,
            comment: "Okay product",
        });
        const rev2 = yield (0, ReviewService_1.createReview)({
            reviewerId: new mongoose_1.default.Types.ObjectId().toString(),
            rating: 4,
            comment: "Pretty good",
        });
        const reviews = yield (0, ReviewService_1.getAllReviews)();
        expect(Array.isArray(reviews)).toBe(true);
        expect(reviews.length).toBe(2);
        expect(reviews).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: rev1.id }),
            expect.objectContaining({ id: rev2.id }),
        ]));
    }));
    it("should update a review", () => __awaiter(void 0, void 0, void 0, function* () {
        const initial = yield ReviewModel_1.Review.create({
            reviewerId: new mongoose_1.default.Types.ObjectId(),
            rating: 2,
            comment: "Needs improvement",
        });
        const newComment = "Actually, it's better than I thought";
        const newRating = 4;
        const updated = yield (0, ReviewService_1.updateReview)({
            id: initial._id.toString(),
            reviewerId: initial.reviewerId.toString(),
            rating: newRating,
            comment: newComment,
        });
        expect(updated.id).toBe(initial._id.toString());
        expect(updated.reviewerId).toBe(initial.reviewerId.toString());
        expect(updated.rating).toBe(newRating);
        expect(updated.comment).toBe(newComment);
    }));
    it("should delete a review", () => __awaiter(void 0, void 0, void 0, function* () {
        const reviewDoc = yield ReviewModel_1.Review.create({
            reviewerId: new mongoose_1.default.Types.ObjectId(),
            rating: 3,
            comment: "Decent",
        });
        const deleted = yield (0, ReviewService_1.deleteReview)(reviewDoc._id.toString());
        expect(deleted.id).toBe(reviewDoc._id.toString());
        expect(deleted.rating).toBe(3);
        expect(deleted.comment).toBe("Decent");
        const check = yield ReviewModel_1.Review.findById(reviewDoc._id);
        expect(check).toBeNull();
    }));
});
