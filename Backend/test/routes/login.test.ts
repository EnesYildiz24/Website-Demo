import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { loginRouter } from "../../src/routes/login";
import { sign } from "jsonwebtoken";
import { jest } from "@jest/globals";
import { login } from "../../src/services/AuthenticationService";
import { verifyJWT } from "../../src/services/JWTService";
import { LoginResource } from "../../src/Resources";

// Mock die Services, die im Login-Router verwendet werden
jest.mock("../../src/services/AuthenticationService");
jest.mock("../../src/services/JWTService");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/login", loginRouter);
// Globaler Error-Handler (falls next(error) verwendet wird)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: "Ein Fehler ist aufgetreten",
    error: err.message || {},
  });
});

describe("Login Router", () => {
  describe("POST /login", () => {
    it("should login successfully and set a cookie", async () => {
      // Mocken eines erfolgreichen Logins
      const mockLoginResult = { id: "507f1f77bcf86cd799439011", role: "admin" };
      (login as jest.MockedFunction<typeof login>).mockResolvedValue(mockLoginResult as LoginResource);

      const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
      const TTL = parseInt(process.env.JWT_TTL || "300");

      const response = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: mockLoginResult.id, role: mockLoginResult.role });
      // Überprüfen, ob der Cookie gesetzt wurde
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("access_token=");
    });

    it("should fail login with invalid credentials", async () => {
      (login as jest.MockedFunction<() => Promise<LoginResource | undefined>>).mockResolvedValue(undefined);
      const response = await request(app)
        .post("/login")
        .send({ email: "wrong@example.com", password: "wrongpassword" });
      expect(response.status).toBe(401);
      expect(response.text).toBe("Login failed");
    });

    it("should return 400 for validation errors", async () => {
      const response = await request(app)
        .post("/login")
        .send({ email: "invalid", password: "short" });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /login", () => {
    it("should return false and clear cookie if no token is present", async () => {
      const response = await request(app).get("/login");
      expect(response.status).toBe(401);
      expect(response.body).toEqual(false);
    });

    it("should return payload if token is valid", async () => {
      const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
      const TTL = parseInt(process.env.JWT_TTL || "300");
      // Erzeuge einen gültigen Token
      const token = sign({ sub: "507f1f77bcf86cd799439011", role: "admin" }, jwtSecret, { expiresIn: TTL });
      const mockPayload = { sub: "507f1f77bcf86cd799439011", role: "admin", exp: Math.floor(Date.now() / 1000) + TTL };
      (verifyJWT as jest.Mock).mockReturnValue(mockPayload);

      const response = await request(app)
        .get("/login")
        .set("Cookie", [`access_token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPayload);
    });

    it("should return false if token is invalid", async () => {
      (verifyJWT as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });
      const response = await request(app)
        .get("/login")
        .set("Cookie", ["access_token=invalidtoken"]);
      expect(response.status).toBe(401);
      expect(response.body).toEqual(false);
    });
  });

  describe("DELETE /login", () => {
    it("should clear the cookie and return 200", async () => {
      const response = await request(app)
        .delete("/login");
      expect(response.status).toBe(200);
    });
  });
});
