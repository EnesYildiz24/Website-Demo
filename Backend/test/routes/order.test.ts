import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { orderRouter } from "../../src/routes/order";
import { sign } from "jsonwebtoken";
import { jest } from "@jest/globals";
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../../src/services/OrderService";
import { OrderResource } from "../../src/Resources";
import { errorHandler } from "../../src/middleware/errorhandler";

// Services werden gemockt
jest.mock("../../src/services/OrderService");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/orders", orderRouter);
// Globaler Error-Handler (falls next(error) verwendet wird)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: "Ein Fehler ist aufgetreten",
    error: err.message || {},
  });
});

// Funktion zum Erzeugen eines gültigen JWT-Tokens (für geschützte Routen)
const generateToken = () => {
  const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
  const cookieName = process.env.COOKIE_NAME || "access_token";
  // Verwende eine gültige 24-stellige Mongo-ID – hier als Beispiel:
  const validId = "507f1f77bcf86cd799439011";
  // Für Order-Routen verwenden wir hier die Rolle "admin"
  const token = sign({ sub: validId, role: "admin" }, jwtSecret, { expiresIn: "1h" });
  return { token, cookieName, validId };
};

describe("Order Routes", () => {
  describe("GET /orders", () => {
    it("should return all orders", async () => {
      const mockOrders: OrderResource[] = [
        {
          id: "507f1f77bcf86cd799439011",
          buyerId: "507f1f77bcf86cd799439022",
          productId: "507f1f77bcf86cd799439033",
          orderDate: "2023-03-01T00:00:00.000Z",
          status: "pending",
          paymentInfo: "Kreditkarte",
        },
        {
          id: "507f1f77bcf86cd799439012",
          buyerId: "507f1f77bcf86cd799439023",
          productId: "507f1f77bcf86cd799439034",
          orderDate: "2023-03-02T00:00:00.000Z",
          status: "completed",
          paymentInfo: "Paypal",
        },
      ];
      (getAllOrders as jest.MockedFunction<typeof getAllOrders>).mockResolvedValue(mockOrders);

      const response = await request(app).get("/orders");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockOrders);
    });

    it("should handle errors on GET /orders", async () => {
      (getAllOrders as jest.MockedFunction<typeof getAllOrders>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get("/orders");
      expect(response.status).toBe(500);
      // Da in der Route der Fehler inline abgefangen wird, erwarten wir hier:
      expect(response.body.message).toBe("Fehler beim Abrufen der Bestellungen");
      // Beim Serialisieren eines Error-Objekts erscheinen die Properties oft als leeres Objekt
      expect(response.body.error).toEqual({});
    });
  });

  describe("GET /orders/:id", () => {
    it("should return an order by id", async () => {
      const orderId = "507f1f77bcf86cd799439011";
      const mockOrder: OrderResource = {
        id: orderId,
        buyerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        orderDate: "2023-03-01T00:00:00.000Z",
        status: "pending",
        paymentInfo: "Kreditkarte",
      };
      (getOrder as jest.MockedFunction<typeof getOrder>).mockResolvedValue(mockOrder);

      const response = await request(app).get(`/orders/${orderId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrder);
    });

    it("should return 404 if order not found", async () => {
      const orderId = "507f1f77bcf86cd799439011";
      (getOrder as jest.MockedFunction<typeof getOrder>).mockResolvedValue(null as any);
      const response = await request(app).get(`/orders/${orderId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `Keine Bestellung mit der ID ${orderId} gefunden` });
    });

    it("should handle errors on GET /orders/:id", async () => {
      const orderId = "507f1f77bcf86cd799439011";
      (getOrder as jest.MockedFunction<typeof getOrder>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get(`/orders/${orderId}`);
      expect(response.status).toBe(500);
      // Da in der Route der Fehler inline abgefangen wird:
      expect(response.body.message).toBe("Fehler beim Abrufen einer Bestellung");
      expect(response.body.error).toEqual({});
    });
  });

  describe("POST /orders", () => {
    const { token, cookieName } = generateToken();

    it("should create a new order", async () => {
      const newOrder = {
        buyerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        orderDate: "2023-03-01T00:00:00.000Z",
        status: "pending",
        paymentInfo: "Kreditkarte",
      };
      const createdOrder: OrderResource = { id: "507f1f77bcf86cd799439011", ...newOrder };
      (createOrder as jest.MockedFunction<typeof createOrder>).mockResolvedValue(createdOrder);

      const response = await request(app)
        .post("/orders")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newOrder);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdOrder);
    });

    it("should return 400 for validation errors on POST /orders", async () => {
      const invalidOrder = {
        buyerId: "invalid", // ungültige Mongo-ID
        productId: "invalid", // ungültige Mongo-ID
        orderDate: "not-a-date",
        status: "wrong", // ungültiger Status
        paymentInfo: "",
      };
      const response = await request(app)
        .post("/orders")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidOrder);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should handle errors on POST /orders", async () => {
      const newOrder = {
        buyerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        orderDate: "2023-03-01T00:00:00.000Z",
        status: "pending",
        paymentInfo: "Kreditkarte",
      };
      (createOrder as jest.MockedFunction<typeof createOrder>).mockRejectedValue(new Error("Error"));

      const response = await request(app)
        .post("/orders")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newOrder);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Erstellen einer Bestellung");
      expect(response.body.error).toEqual({});
    });
  });

  describe("PUT /orders/:id", () => {
    const { token, cookieName, validId } = generateToken();

    it("should update an order", async () => {
      const updatedData = {
        buyerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        orderDate: "2023-03-02T00:00:00.000Z",
        status: "completed",
        paymentInfo: "Paypal",
      };
      const updatedOrder: OrderResource = { id: validId, ...updatedData };
      (updateOrder as jest.MockedFunction<typeof updateOrder>).mockResolvedValue(updatedOrder);

      const response = await request(app)
        .put(`/orders/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedOrder);
    });

    it("should return 400 for validation errors on PUT /orders", async () => {
      const invalidData = {
        buyerId: "invalid",
        productId: "invalid",
        orderDate: "not-a-date",
        status: "wrong",
        paymentInfo: "",
      };
      const response = await request(app)
        .put(`/orders/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 404 if order not found on PUT /orders", async () => {
      (updateOrder as jest.MockedFunction<typeof updateOrder>).mockResolvedValue(null as any);
      const updatedData = {
        buyerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        orderDate: "2023-03-02T00:00:00.000Z",
        status: "completed",
        paymentInfo: "Paypal",
      };
      const response = await request(app)
        .put(`/orders/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `Keine Bestellung mit der ID ${validId} gefunden, Update nicht möglich`,
      });
    });

    it("should handle errors on PUT /orders/:id", async () => {
      (updateOrder as jest.MockedFunction<typeof updateOrder>).mockRejectedValue(new Error("Error"));
      const updatedData = {
        buyerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        orderDate: "2023-03-02T00:00:00.000Z",
        status: "completed",
        paymentInfo: "Paypal",
      };
      const response = await request(app)
        .put(`/orders/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(500);
      // In der PUT-Route wird der Fehler via next(error) weitergereicht und vom Error-Handler verarbeitet
      expect(response.body.message).toBe("Ein Fehler ist aufgetreten");
      expect(response.body.error).toBe("Error");
    });
  });

  describe("DELETE /orders/:id", () => {
    const { token, cookieName, validId } = generateToken();

    it("should delete an order", async () => {
      (deleteOrder as jest.MockedFunction<typeof deleteOrder>).mockResolvedValue({
        id: validId,
        buyerId: "507f1f77bcf86cd799439022",
        productId: "507f1f77bcf86cd799439033",
        orderDate: "2023-03-01T00:00:00.000Z",
        status: "pending",
        paymentInfo: "Kreditkarte",
      });
      const response = await request(app)
        .delete(`/orders/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(204);
    });

    it("should return 404 if order not found on DELETE /orders/:id", async () => {
      (deleteOrder as jest.MockedFunction<typeof deleteOrder>).mockResolvedValue(null as any);
      const response = await request(app)
        .delete(`/orders/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Bestellung nicht gefunden oder bereits gelöscht" });
    });

    it("should handle errors on DELETE /orders/:id", async () => {
      (deleteOrder as jest.MockedFunction<typeof deleteOrder>).mockRejectedValue(new Error("Error"));
      const response = await request(app)
        .delete(`/orders/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Löschen einer Bestellung");
      expect(response.body.error).toEqual({});
    });
  });
});
