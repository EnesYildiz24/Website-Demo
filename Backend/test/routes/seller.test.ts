import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { sellerRouter } from "../../src/routes/seller";
import { sign } from "jsonwebtoken";
import { jest } from "@jest/globals";
import { SellerResource } from "../../src/Resources";
import {
  getAllSeller,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller,
} from "../../src/services/SellerService";
import { errorHandler } from "../../src/middleware/errorhandler";

// SellerService-Funktionen werden gemockt
jest.mock("../../src/services/SellerService");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/sellers", sellerRouter);
app.use(errorHandler);

const generateSellerToken = () => {
  const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
  const cookieName = process.env.COOKIE_NAME || "access_token";
  // Verwende eine gültige 24-stellige Mongo-ID:
  const validId = "507f1f77bcf86cd799439011";
  const token = sign({ sub: validId, role: "seller" }, jwtSecret, {
    expiresIn: "1h",
  });
  return { token, cookieName, validId };
};

describe("Seller Routes", () => {
  describe("GET /sellers", () => {
    it("should return all sellers", async () => {
      const mockSellers = [
        {
          id: "507f1f77bcf86cd799439011",
          username: "seller1",
          email: "seller1@example.com",
          role: "seller",
          shopName: "Shop1",
          contactInfo: "123",
        },
        {
          id: "507f1f77bcf86cd799439012",
          username: "seller2",
          email: "seller2@example.com",
          role: "seller",
          shopName: "Shop2",
          contactInfo: "456",
        },
      ];
      (getAllSeller as jest.MockedFunction<typeof getAllSeller>).mockResolvedValue(mockSellers as SellerResource[]);
      
      const response = await request(app).get("/sellers");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockSellers);
    });
    
    it("should handle errors on GET /sellers", async () => {
      (getAllSeller as jest.MockedFunction<typeof getAllSeller>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get("/sellers");
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Abrufen der Verkäufer");
    });
  });
  
  describe("GET /sellers/:id", () => {
    it("should return a seller by id", async () => {
      const sellerId = "507f1f77bcf86cd799439011";
      const mockSeller = {
        id: sellerId,
        username: "seller1",
        email: "seller1@example.com",
        role: "seller",
        shopName: "Shop1",
        contactInfo: "123",
      };
      (getSeller as jest.MockedFunction<typeof getSeller>).mockResolvedValue(mockSeller as SellerResource);
      
      const response = await request(app).get(`/sellers/${sellerId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSeller);
    });
    
    it("should return 404 if seller not found", async () => {
      const sellerId = "507f1f77bcf86cd799439011";
      (getSeller as jest.MockedFunction<typeof getSeller>).mockResolvedValue(null as any);
      const response = await request(app).get(`/sellers/${sellerId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `Kein Verkäufer mit der ID ${sellerId} gefunden` });
    });
    
    it("should handle errors on GET /sellers/:id", async () => {
      const sellerId = "507f1f77bcf86cd799439011";
      (getSeller as jest.MockedFunction<typeof getSeller>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get(`/sellers/${sellerId}`);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Abrufen eines Verkäufers");
    });
  });
  
  describe("POST /sellers", () => {
    const { token, cookieName, validId } = generateSellerToken();
    
    it("should create a new seller", async () => {
      const newSeller = {
        username: "sellerNew",
        email: "sellernew@example.com",
        password: "password123",
        role: "seller",
        shopName: "New Shop",
        contactInfo: "789",
      };
      const createdSeller: SellerResource = { id: validId, ...newSeller, role: "seller" };
      (createSeller as jest.MockedFunction<typeof createSeller>).mockResolvedValue(createdSeller);
      
      const response = await request(app)
        .post("/sellers")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newSeller);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdSeller);
    });
    
    it("should return 400 for validation errors on POST /sellers", async () => {
      const invalidSeller = {
        username: "",
        email: "invalid",
        password: "123",
        role: "buyer", // Falsche Rolle
        shopName: "",
        contactInfo: "",
      };
      const response = await request(app)
        .post("/sellers")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidSeller);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    
    it("should handle errors on POST /sellers", async () => {
      const newSeller = {
        username: "sellerNew",
        email: "sellernew@example.com",
        password: "password123",
        role: "seller",
        shopName: "New Shop",
        contactInfo: "789",
      };
      (createSeller as jest.MockedFunction<typeof createSeller>).mockRejectedValue(new Error("Error"));
      
      const response = await request(app)
        .post("/sellers")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newSeller);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Erstellen eines Verkäufers");
    });
  });
  
  describe("PUT /sellers/:id", () => {
    const { token, cookieName, validId } = generateSellerToken();
    
    it("should update a seller", async () => {
      const updatedData = {
        username: "updatedSeller",
        email: "updated@example.com",
        password: "newpassword123",
        role: "seller",
        shopName: "Updated Shop",
        contactInfo: "987",
      };
      const updatedSeller: SellerResource = { id: validId, ...updatedData, role: "seller" };
      (updateSeller as jest.MockedFunction<typeof updateSeller>).mockResolvedValue(updatedSeller);
      
      const response = await request(app)
        .put(`/sellers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedSeller);
    });
    
    it("should return 400 for validation errors on PUT /sellers", async () => {
      const invalidData = {
        username: "",
        email: "invalid",
        password: "123",
        role: "buyer", // Falsche Rolle
        shopName: "",
        contactInfo: "",
      };
      const response = await request(app)
        .put(`/sellers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    
    it("should return 404 if seller not found on PUT /sellers", async () => {
      (updateSeller as jest.MockedFunction<typeof updateSeller>).mockResolvedValue(null as any);
      const updatedData = {
        username: "updatedSeller",
        email: "updated@example.com",
        password: "newpassword123",
        role: "seller",
        shopName: "Updated Shop",
        contactInfo: "987",
      };
      const response = await request(app)
        .put(`/sellers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `Kein Verkäufer mit der ID ${validId} gefunden, Update nicht möglich`,
      });
    });
    
    it("should handle errors on PUT /sellers/:id", async () => {
      (updateSeller as jest.MockedFunction<typeof updateSeller>).mockRejectedValue(new Error("Error"));
      const updatedData = {
        username: "updatedSeller",
        email: "updated@example.com",
        password: "newpassword123",
        role: "seller",
        shopName: "Updated Shop",
        contactInfo: "987",
      };
      const response = await request(app)
        .put(`/sellers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Ein Fehler ist aufgetreten");
      expect(response.body.error).toBe("Error"); // Falls der Fehler "Error" ist

    });
  });
  
  describe("DELETE /sellers/:id", () => {
    const { token, cookieName, validId } = generateSellerToken();
    
    it("should delete a seller", async () => {
      (deleteSeller as jest.MockedFunction<typeof deleteSeller>).mockResolvedValue({
        id: validId,
        username: "sellerToDelete",
        email: "deletethis@example.com",
        role: "seller",
        shopName: "Shop",
        contactInfo: "123",
      });
      
      const response = await request(app)
        .delete(`/sellers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(204);
    });
    
    it("should return 404 if seller not found on DELETE", async () => {
      (deleteSeller as jest.MockedFunction<typeof deleteSeller>).mockResolvedValue(null as any);
      const response = await request(app)
        .delete(`/sellers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Verkäufer nicht gefunden oder bereits gelöscht",
      });
    });
    
    it("should handle errors on DELETE /sellers/:id", async () => {
      (deleteSeller as jest.MockedFunction<typeof deleteSeller>).mockRejectedValue(new Error("Error"));
      const response = await request(app)
        .delete(`/sellers/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Löschen eines Verkäufers");
    });
  });
});
