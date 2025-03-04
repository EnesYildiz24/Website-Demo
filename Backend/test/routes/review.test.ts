import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { reviewRouter } from "../../src/routes/review";
import { sign } from "jsonwebtoken";
import { jest } from "@jest/globals";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../../src/services/ReviewService";
import { ReviewResource } from "../../src/Resources";

// ReviewService wird gemockt
jest.mock("../../src/services/ReviewService");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/reviews", reviewRouter);
// Globaler Error-Handler (für Fehler, die via next(error) weitergereicht werden)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: "Ein Fehler ist aufgetreten",
    error: err.message || {},
  });
});

// Funktion zum Erzeugen eines gültigen JWT-Tokens für geschützte Routen
const generateToken = () => {
  const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
  const cookieName = process.env.COOKIE_NAME || "access_token";
  // Verwende eine gültige 24-stellige Mongo-ID (als String)
  const validId = "507f1f77bcf86cd799439011";
  // Für geschützte Routen verwenden wir hier z. B. die Rolle "admin"
  const token = sign({ sub: validId, role: "admin" }, jwtSecret, { expiresIn: "1h" });
  return { token, cookieName, validId };
};

describe("Review Routes", () => {
  describe("GET /reviews", () => {
    it("should return all reviews", async () => {
      const mockReviews: ReviewResource[] = [
        {
          id: "507f1f77bcf86cd799439011",
          reviewerId: "507f1f77bcf86cd799439022",
          productId: "507f1f77bcf86cd799439033",
          sellerId: "507f1f77bcf86cd799439044",
          rating: 5,
          comment: "Great product!",
        },
        {
          id: "507f1f77bcf86cd799439012",
          reviewerId: "507f1f77bcf86cd799439023",
          productId: "507f1f77bcf86cd799439034",
          sellerId: "507f1f77bcf86cd799439045",
          rating: 4,
          comment: "Good value.",
        },
      ];
      (getAllReviews as jest.MockedFunction<typeof getAllReviews>).mockResolvedValue(mockReviews);
      const response = await request(app).get("/reviews");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockReviews);
    });

    it("should handle errors on GET /reviews", async () => {
      (getAllReviews as jest.MockedFunction<typeof getAllReviews>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get("/reviews");
      expect(response.status).toBe(500);
      // In der Route wird der Fehler inline abgefangen
      expect(response.body.message).toBe("Fehler beim Abrufen der Reviews");
      // Da Error-Objekte oft als {} serialisiert werden, erwarten wir {} hier
      expect(response.body.error).toEqual({});
    });
  });

  describe("GET /reviews/:id", () => {
    it("should return a review by id", async () => {
      const reviewId = "507f1f77bcf86cd799439011";
      const mockReview: ReviewResource = {
        id: reviewId,
        reviewerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        sellerId: "507f1f77bcf86cd799439044",
        rating: 5,
        comment: "Great product!",
      };
      (getReview as jest.MockedFunction<typeof getReview>).mockResolvedValue(mockReview);
      const response = await request(app).get(`/reviews/${reviewId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReview);
    });

    it("should return 404 if review not found", async () => {
      const reviewId = "507f1f77bcf86cd799439011";
      (getReview as jest.MockedFunction<typeof getReview>).mockResolvedValue(null as any);
      const response = await request(app).get(`/reviews/${reviewId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `Keine Review mit der ID ${reviewId} gefunden` });
    });

    it("should handle errors on GET /reviews/:id", async () => {
      const reviewId = "507f1f77bcf86cd799439011";
      (getReview as jest.MockedFunction<typeof getReview>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get(`/reviews/${reviewId}`);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Abrufen einer Review");
      expect(response.body.error).toEqual({});
    });
  });

  describe("POST /reviews", () => {
    const { token, cookieName, validId } = generateToken();
    it("should create a new review", async () => {
      const newReview = {
        reviewerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        sellerId: "507f1f77bcf86cd799439044",
        rating: 5,
        comment: "Excellent product!",
      };
      const createdReview: ReviewResource = { id: validId, ...newReview };
      (createReview as jest.MockedFunction<typeof createReview>).mockResolvedValue(createdReview);
      const response = await request(app)
        .post("/reviews")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newReview);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdReview);
    });

    it("should return 400 for validation errors on POST /reviews", async () => {
      const invalidReview = {
        reviewerId: "invalid", // ungültige ID
        productId: "invalid",
        sellerId: "invalid",
        rating: 10, // außerhalb des erlaubten Bereichs
        comment: "", // leer
      };
      const response = await request(app)
        .post("/reviews")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidReview);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should handle errors on POST /reviews", async () => {
      const newReview = {
        reviewerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        sellerId: "507f1f77bcf86cd799439044",
        rating: 5,
        comment: "Excellent product!",
      };
      (createReview as jest.MockedFunction<typeof createReview>).mockRejectedValue(new Error("Error"));
      const response = await request(app)
        .post("/reviews")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newReview);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Erstellen einer Review");
      expect(response.body.error).toEqual({});
    });
  });

  describe("PUT /reviews/:id", () => {
    const { token, cookieName, validId } = generateToken();
    it("should update a review", async () => {
      const updatedData = {
        reviewerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        sellerId: "507f1f77bcf86cd799439044",
        rating: 4,
        comment: "Good product",
      };
      const updatedReview: ReviewResource = { id: validId, ...updatedData };
      (updateReview as jest.MockedFunction<typeof updateReview>).mockResolvedValue(updatedReview);
      const response = await request(app)
        .put(`/reviews/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedReview);
    });

    it("should return 400 for validation errors on PUT /reviews", async () => {
      const invalidData = {
        reviewerId: "invalid",
        productId: "invalid",
        sellerId: "invalid",
        rating: 0, // zu niedrig
        comment: "", // leer
      };
      const response = await request(app)
        .put(`/reviews/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 404 if review not found on PUT /reviews", async () => {
      (updateReview as jest.MockedFunction<typeof updateReview>).mockResolvedValue(null as any);
      const updatedData = {
        reviewerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        sellerId: "507f1f77bcf86cd799439044",
        rating: 4,
        comment: "Good product",
      };
      const response = await request(app)
        .put(`/reviews/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `Keine Review mit der ID ${validId} gefunden, Update nicht möglich`,
      });
    });

    it("should handle errors on PUT /reviews/:id", async () => {
      (updateReview as jest.MockedFunction<typeof updateReview>).mockRejectedValue(new Error("Error"));
      const updatedData = {
        reviewerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        sellerId: "507f1f77bcf86cd799439044",
        rating: 4,
        comment: "Good product",
      };
      const response = await request(app)
        .put(`/reviews/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(500);
      // Da der Fehler via next(error) weitergereicht wird, wird er vom globalen Error-Handler verarbeitet:
      expect(response.body.message).toBe("Ein Fehler ist aufgetreten");
      expect(response.body.error).toBe("Error");
    });
  });

  describe("DELETE /reviews/:id", () => {
    const { token, cookieName, validId } = generateToken();
    it("should delete a review", async () => {
      (deleteReview as jest.MockedFunction<typeof deleteReview>).mockResolvedValue({
        id: validId,
        reviewerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        sellerId: "507f1f77bcf86cd799439044",
        rating: 5,
        comment: "Great product!",
      });
      const response = await request(app)
        .delete(`/reviews/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(204);
    });

    it("should return 404 if review not found on DELETE /reviews/:id", async () => {
      (deleteReview as jest.MockedFunction<typeof deleteReview>).mockResolvedValue(null as any);
      const response = await request(app)
        .delete(`/reviews/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Review nicht gefunden oder bereits gelöscht" });
    });

    it("should handle errors on DELETE /reviews/:id", async () => {
      (deleteReview as jest.MockedFunction<typeof deleteReview>).mockRejectedValue(new Error("Error"));
      const response = await request(app)
        .delete(`/reviews/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Löschen einer Review");
      expect(response.body.error).toEqual({});
    });
  });
});
