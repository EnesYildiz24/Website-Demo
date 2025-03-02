import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express from "express";
import { userRouter } from "../../src/routes/user";
import { jest } from "@jest/globals";
import { UserResource } from "../../src/Resources";
import {
  createUser,
  deleteUser,
  getAlleUser,
  getUser,
  updateUser,
} from "../../src/services/UserService";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { sign } from "jsonwebtoken";

jest.mock("../../src/services/UserService");
jest.mock("../../src/model/UserModel");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/users", userRouter);

interface Error {
  message: string;
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.message === "Unauthorized" ? 401 : 500;
  res.status(statusCode).json({
    message:
      statusCode === 401
        ? "Nicht autorisiert"
        : "Fehler beim Aktualisieren eines Users",
    error: err,
  });
});

describe("User Routes", () => {
  describe("GET /users", () => {
    it("should return all users", async () => {
      const mockUsers = [
        {
          id: "1",
          username: "testuser",
          email: "test@example.com",
          role: "admin",
        },
      ];
      (
        getAlleUser as jest.MockedFunction<typeof getAlleUser>
      ).mockResolvedValue(mockUsers);

      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });

    it("should handle errors", async () => {
      (
        getAlleUser as jest.MockedFunction<typeof getAlleUser>
      ).mockRejectedValue(new Error("Error"));

      const response = await request(app).get("/users");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Fehler beim Abrufen der User",
        error: {},
      });
    });
  });

  describe("GET /users/:id", () => {
    it("should return a user by ID", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        role: "admin",
      };
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValue(
        mockUser
      );

      const response = await request(app).get("/users/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it("should return 404 if user not found", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockResolvedValue(
        null as any
      );

      const response = await request(app).get("/users/1");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Kein User mit der ID 1 gefunden",
      });
    });

    it("should handle errors", async () => {
      (getUser as jest.MockedFunction<typeof getUser>).mockRejectedValue(
        new Error("Error")
      );

      const response = await request(app).get("/users/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Fehler beim Abrufen eines Users",
        error: {},
      });
    });
  });

  describe("POST /users", () => {
    const validId = "507f1f77bcf86cd799439011";
    const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
    const cookieName = process.env.COOKIE_NAME || "access_token";
    const token = sign({ sub: validId, role: "admin" }, jwtSecret, {
      expiresIn: "1h",
    });

    it("should create a new user", async () => {
      const mockUser = {
        id: validId,
        username: "testuser",
        email: "test@example.com",
        role: "admin",
      };
      (createUser as jest.MockedFunction<typeof createUser>).mockResolvedValue(
        mockUser
      );

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`${cookieName}=${token}`])
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password",
          role: "admin",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUser);
    });

    it("should return 400 for validation errors", async () => {
      const response = await request(app)
        .post("/users")
        .set("Cookie", [`${cookieName}=${token}`])
        .send({
          username: "",
          email: "invalid",
          password: "123",
          role: "invalid",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(4);
    });

    it("should handle errors", async () => {
      (createUser as jest.MockedFunction<typeof createUser>).mockRejectedValue(
        new Error("Error")
      );

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`${cookieName}=${token}`])
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password",
          role: "admin",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Fehler beim Erstellen eines Users",
        error: {},
      });
    });
  });
  describe("PUT /users/:id", () => {
    const validId = "507f1f77bcf86cd799439011";
    const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
    const cookieName = process.env.COOKIE_NAME || "access_token";
    const token = sign({ sub: validId, role: "admin" }, jwtSecret, {
      expiresIn: "1h",
    });
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it("should update a user", async () => {
      (updateUser as jest.MockedFunction<typeof updateUser>).mockResolvedValue({
        id: validId,
        username: "updateduser",
        email: "updated@example.com",
        role: "admin",
      });

      const response = await request(app)
        .put(`/users/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send({
          username: "updateduser",
          email: "updated@example.com",
          password: "newpassword",
          role: "admin",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: validId,
        username: "updateduser",
        email: "updated@example.com",
        role: "admin",
      });
    });

    it("should return 400 if param is not a valid Mongo ID", async () => {
      const invalidId = "1"; // triggers param validation error
      const response = await request(app)
        .put(`/users/${invalidId}`)
        .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
        .send({
          username: "updateduser",
          email: "updated@example.com",
          password: "newpassword",
          role: "admin",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toBe("Ungültige User-ID");
    });

    it("should return 404 if user not found", async () => {
      (updateUser as jest.MockedFunction<typeof updateUser>).mockResolvedValue(
        null as any
      );

      const response = await request(app)
        .put(`/users/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
        .send({
          username: "updateduser",
          email: "updated@example.com",
          password: "newpassword",
          role: "admin",
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `Kein User mit der ID ${validId} gefunden, Update nicht möglich`,
      });
    });

    it("should handle errors", async () => {
      (updateUser as jest.MockedFunction<typeof updateUser>).mockRejectedValue(
        new Error("Error")
      );

      const response = await request(app)
        .put(`/users/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
        .send({
          username: "updateduser",
          email: "updated@example.com",
          password: "newpassword",
          role: "admin",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Fehler beim Aktualisieren eines Users",
        error: {},
      });
    });
  });
  describe("DELETE /users/:id", () => {
    const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
    const cookieName = process.env.COOKIE_NAME || "access_token";
    const validId = "507f1f77bcf86cd799439011";

    it("should delete a user", async () => {
      (deleteUser as jest.MockedFunction<typeof deleteUser>).mockResolvedValue({
        id: validId,
        username: "testuser",
        email: "test@example.com",
        role: "admin",
      });

      const token = sign({ sub: validId, role: "admin" }, jwtSecret, {
        expiresIn: "1h",
      });

      const response = await request(app)
        .delete(`/users/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);

      expect(response.status).toBe(204);
    });

    it("should return 404 if user not found", async () => {
      (deleteUser as jest.MockedFunction<typeof deleteUser>).mockResolvedValue(
        null as unknown as UserResource
      );

      const token = sign({ sub: validId, role: "admin" }, jwtSecret, {
        expiresIn: "1h",
      });
      const response = await request(app)
        .delete(`/users/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "User nicht gefunden oder bereits gelöscht",
      });
    });

    it("should handle errors", async () => {
      (deleteUser as jest.MockedFunction<typeof deleteUser>).mockRejectedValue(
        new Error("Error")
      );
      const token = sign({ sub: validId, role: "admin" }, jwtSecret, {
        expiresIn: "1h",
      });
      const response = await request(app)
        .delete(`/users/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Fehler beim Löschen eines Users",
        error: {},
      });
    });
  });
});
