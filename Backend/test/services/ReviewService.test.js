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
    it("should update a review", () => __awaiter(void 0, void 0, void 0, function* () {
        const initial = yield ReviewModel_1.Review.create({
            reviewerId: new mongoose_1.default.Types.ObjectId(),
            reviewerName: "Jane Doe",
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
            reviewerName: "John Doe",
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
