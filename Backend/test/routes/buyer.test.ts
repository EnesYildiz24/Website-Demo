import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { buyerRouter } from "../../src/routes/buyer";
import { sign } from "jsonwebtoken";
import { jest } from "@jest/globals";
import {
  getAllBuyers,
  getBuyer,
  createBuyer,
  updateBuyer,
  deleteBuyer,
} from "../../src/services/BuyerService";
import { BuyerResource } from "../../src/Resources";
import { errorHandler } from "../../src/middleware/errorhandler";

// BuyerService wird gemockt
jest.mock("../../src/services/BuyerService");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/buyers", buyerRouter);
app.use(errorHandler);


// Funktion zum Erzeugen eines gültigen JWT-Tokens für Käufer
const generateBuyerToken = () => {
  const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
  const cookieName = process.env.COOKIE_NAME || "access_token";
  // Verwende eine gültige 24-stellige Mongo-ID:
  const validId = "507f1f77bcf86cd799439011";
  const token = sign({ sub: validId, role: "buyer" }, jwtSecret, { expiresIn: "1h" });
  return { token, cookieName, validId };
};

describe("Buyer Routes", () => {
  describe("GET /buyers", () => {
    it("should return all buyers", async () => {
      const mockBuyers = [
        {
          id: "507f1f77bcf86cd799439011",
          username: "buyer1",
          email: "buyer1@example.com",
          role: "buyer",
        },
        {
          id: "507f1f77bcf86cd799439012",
          username: "buyer2",
          email: "buyer2@example.com",
          role: "buyer",
        },
      ];
      (getAllBuyers as jest.MockedFunction<typeof getAllBuyers>).mockResolvedValue(mockBuyers as BuyerResource[]);

      const response = await request(app).get("/buyers");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockBuyers);
    });

    it("should handle errors on GET /buyers", async () => {
      (getAllBuyers as jest.MockedFunction<typeof getAllBuyers>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get("/buyers");
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Abrufen der Käufer");
      expect(response.body.error).toEqual({});
      
    });
  });

  describe("GET /buyers/:id", () => {
    it("should return a buyer by id", async () => {
      const buyerId = "507f1f77bcf86cd799439011";
      const mockBuyer = {
        id: buyerId,
        username: "buyer1",
        email: "buyer1@example.com",
        role: "buyer" as const,
      };
      (getBuyer as jest.MockedFunction<typeof getBuyer>).mockResolvedValue(mockBuyer);

      const response = await request(app).get(`/buyers/${buyerId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBuyer);
    });

    it("should return 404 if buyer not found", async () => {
      const buyerId = "507f1f77bcf86cd799439011";
      (getBuyer as jest.MockedFunction<typeof getBuyer>).mockResolvedValue(null as any);
      const response = await request(app).get(`/buyers/${buyerId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `Kein Käufer mit der ID ${buyerId} gefunden` });
    });

    it("should handle errors on GET /buyers/:id", async () => {
      const buyerId = "507f1f77bcf86cd799439011";
      (getBuyer as jest.MockedFunction<typeof getBuyer>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get(`/buyers/${buyerId}`);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Abrufen eines Käufers");
      expect(response.body.error).toEqual({});
      
    });
  });

  describe("POST /buyers", () => {
    const { token, cookieName, validId } = generateBuyerToken();

    it("should create a new buyer", async () => {
      const newBuyer = {
        username: "buyerNew",
        email: "buyernew@example.com",
        password: "password123",
        role: "buyer",
      };
      const createdBuyer = { id: validId, ...newBuyer, role: "buyer" as const };
      (createBuyer as jest.MockedFunction<typeof createBuyer>).mockResolvedValue(createdBuyer);

      const response = await request(app)
        .post("/buyers")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newBuyer);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdBuyer);
    });

    it("should return 400 for validation errors on POST /buyers", async () => {
      const invalidBuyer = {
        username: "",
        email: "invalid",
        password: "123",
        role: "admin", // falsche Rolle, muss "buyer" sein
      };
      const response = await request(app)
        .post("/buyers")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidBuyer);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should handle errors on POST /buyers", async () => {
      const newBuyer = {
        username: "buyerNew",
        email: "buyernew@example.com",
        password: "password123",
        role: "buyer",
      };
      (createBuyer as jest.MockedFunction<typeof createBuyer>).mockRejectedValue(new Error("Error"));

      const response = await request(app)
        .post("/buyers")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newBuyer);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Erstellen eines Käufers");
      expect(response.body.error).toEqual({});
      
    });
  });

  describe("PUT /buyers/:id", () => {
    const { token, cookieName, validId } = generateBuyerToken();

    it("should update a buyer", async () => {
      const updatedData = {
        username: "updatedBuyer",
        email: "updated@example.com",
        password: "newpassword123",
        role: "buyer",
      };
      const updatedBuyer = { id: validId, ...updatedData, role: "buyer" as const };
      (updateBuyer as jest.MockedFunction<typeof updateBuyer>).mockResolvedValue(updatedBuyer);

      const response = await request(app)
        .put(`/buyers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedBuyer);
    });

    it("should return 400 for validation errors on PUT /buyers", async () => {
      const invalidData = {
        username: "",
        email: "invalid",
        password: "123",
        role: "admin", // falsche Rolle
      };
      const response = await request(app)
        .put(`/buyers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 404 if buyer not found on PUT /buyers", async () => {
      (updateBuyer as jest.MockedFunction<typeof updateBuyer>).mockResolvedValue(null as any);
      const updatedData = {
        username: "updatedBuyer",
        email: "updated@example.com",
        password: "newpassword123",
        role: "buyer",
      };
      const response = await request(app)
        .put(`/buyers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `Kein Käufer mit der ID ${validId} gefunden, Update nicht möglich`,
      });
    });

    it("should handle errors on PUT /buyers/:id", async () => {
      (updateBuyer as jest.MockedFunction<typeof updateBuyer>).mockRejectedValue(new Error("Error"));
      const updatedData = {
        username: "updatedBuyer",
        email: "updated@example.com",
        password: "newpassword123",
        role: "buyer",
      };
      const response = await request(app)
        .put(`/buyers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Ein Fehler ist aufgetreten");
      expect(response.body.error).toBe("Error");
    });
  });

  describe("DELETE /buyers/:id", () => {
    const { token, cookieName, validId } = generateBuyerToken();

    it("should delete a buyer", async () => {
      (deleteBuyer as jest.MockedFunction<typeof deleteBuyer>).mockResolvedValue({
        id: validId,
        username: "buyerToDelete",
        email: "delete@example.com",
        role: "buyer",
      });
      const response = await request(app)
        .delete(`/buyers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(204);
    });

    it("should return 404 if buyer not found on DELETE", async () => {
      (deleteBuyer as jest.MockedFunction<typeof deleteBuyer>).mockResolvedValue(null as any);
      const response = await request(app)
        .delete(`/buyers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Käufer nicht gefunden oder bereits gelöscht" });
    });

    it("should handle errors on DELETE /buyers/:id", async () => {
      (deleteBuyer as jest.MockedFunction<typeof deleteBuyer>).mockRejectedValue(new Error("Error"));
      const response = await request(app)
        .delete(`/buyers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Löschen eines Käufers");
      expect(response.body.error).toEqual({});
      
    });
  });
});
