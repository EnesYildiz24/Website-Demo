import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { categoryRouter } from "../../src/routes/category";
import { sign } from "jsonwebtoken";
import { jest } from "@jest/globals";
import {
  createCategory,
  getAlleCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../../src/services/CategoryService";
import { CategoryResource } from "../../src/Resources";

// CategoryService wird gemockt
jest.mock("../../src/services/CategoryService");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/categories", categoryRouter);

// Optionaler Error-Handler, falls ein Fehler über next(error) weitergereicht wird
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
  // Verwende eine gültige 24-stellige Mongo-ID:
  const validId = "507f1f77bcf86cd799439011";
  // Für diese Routen ist die Rolle nicht explizit relevant – verwende "admin"
  const token = sign({ sub: validId, role: "admin" }, jwtSecret, { expiresIn: "1h" });
  return { token, cookieName, validId };
};

describe("Category Routes", () => {
  describe("GET /categories", () => {
    it("should return all categories", async () => {
      const mockCategories: CategoryResource[] = [
        { id: "507f1f77bcf86cd799439011", name: "Kategorie 1", description: "Beschreibung 1" },
        { id: "507f1f77bcf86cd799439012", name: "Kategorie 2", description: "Beschreibung 2" },
      ];
      (getAlleCategory as jest.MockedFunction<typeof getAlleCategory>).mockResolvedValue(mockCategories);

      const response = await request(app).get("/categories");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockCategories);
    });

    it("should handle errors on GET /categories", async () => {
      (getAlleCategory as jest.MockedFunction<typeof getAlleCategory>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get("/categories");
      expect(response.status).toBe(500);
      // Da in der Route der Fehler inline abgefangen wird, kommt die Nachricht "Fehler beim Abrufen der Kategorien"
      expect(response.body.message).toBe("Fehler beim Abrufen der Kategorien");
      // Da ein Error-Objekt beim Serialisieren oft als leeres Objekt erscheint:
      expect(response.body.error).toEqual({});
    });
  });

  describe("GET /categories/:id", () => {
    it("should return a category by id", async () => {
      const categoryId = "507f1f77bcf86cd799439011";
      const mockCategory: CategoryResource = {
        id: categoryId,
        name: "Kategorie 1",
        description: "Beschreibung 1",
      };
      (getCategory as jest.MockedFunction<typeof getCategory>).mockResolvedValue(mockCategory);

      const response = await request(app).get(`/categories/${categoryId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategory);
    });

    it("should return 404 if category not found", async () => {
      const categoryId = "507f1f77bcf86cd799439011";
      (getCategory as jest.MockedFunction<typeof getCategory>).mockResolvedValue(null as any);
      const response = await request(app).get(`/categories/${categoryId}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `Keine Kategorie mit der ID ${categoryId} gefunden` });
    });

    it("should handle errors on GET /categories/:id", async () => {
      const categoryId = "507f1f77bcf86cd799439011";
      (getCategory as jest.MockedFunction<typeof getCategory>).mockRejectedValue(new Error("Error"));
      const response = await request(app).get(`/categories/${categoryId}`);
      expect(response.status).toBe(500);
      // In der Route wird der Fehler inline behandelt
      expect(response.body.message).toBe("Fehler beim Abrufen einer Kategorie");
      expect(response.body.error).toEqual({});
    });
  });

  describe("POST /categories", () => {
    const { token, cookieName } = generateToken();

    it("should create a new category", async () => {
      const newCategory = {
        name: "Neue Kategorie",
        description: "Beschreibung der neuen Kategorie",
      };
      const createdCategory: CategoryResource = { id: "507f1f77bcf86cd799439011", ...newCategory };
      (createCategory as jest.MockedFunction<typeof createCategory>).mockResolvedValue(createdCategory);

      const response = await request(app)
        .post("/categories")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newCategory);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdCategory);
    });

    it("should return 400 for validation errors on POST /categories", async () => {
      const invalidCategory = {
        name: "", // leer -> ungültig
        description: 123, // ungültiger Typ
      };
      const response = await request(app)
        .post("/categories")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidCategory);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should handle errors on POST /categories", async () => {
      const newCategory = {
        name: "Neue Kategorie",
        description: "Beschreibung der neuen Kategorie",
      };
      (createCategory as jest.MockedFunction<typeof createCategory>).mockRejectedValue(new Error("Error"));

      const response = await request(app)
        .post("/categories")
        .set("Cookie", [`${cookieName}=${token}`])
        .send(newCategory);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Erstellen einer Kategorie");
      // Da Error-Objekte beim Inline-Serialisieren oft als {} erscheinen:
      expect(response.body.error).toEqual({});
    });
  });

  describe("PUT /categories/:id", () => {
    const { token, cookieName, validId } = generateToken();

    it("should update a category", async () => {
      const updatedData = {
        name: "Aktualisierte Kategorie",
        description: "Aktualisierte Beschreibung",
      };
      const updatedCategory: CategoryResource = { id: validId, ...updatedData };
      (updateCategory as jest.MockedFunction<typeof updateCategory>).mockResolvedValue(updatedCategory);

      const response = await request(app)
        .put(`/categories/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedCategory);
    });

    it("should return 400 for validation errors on PUT /categories", async () => {
      const invalidData = {
        name: "", // leer
        description: 123, // ungültiger Typ
      };
      const response = await request(app)
        .put(`/categories/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 404 if category not found on PUT /categories", async () => {
      (updateCategory as jest.MockedFunction<typeof updateCategory>).mockResolvedValue(null as any);
      const updatedData = {
        name: "Aktualisierte Kategorie",
        description: "Aktualisierte Beschreibung",
      };
      const response = await request(app)
        .put(`/categories/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `Keine Kategorie mit der ID ${validId} gefunden, Update nicht möglich`,
      });
    });

    it("should handle errors on PUT /categories/:id", async () => {
      (updateCategory as jest.MockedFunction<typeof updateCategory>).mockRejectedValue(new Error("Error"));
      const updatedData = {
        name: "Aktualisierte Kategorie",
        description: "Aktualisierte Beschreibung",
      };
      const response = await request(app)
        .put(`/categories/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`])
        .send(updatedData);
      expect(response.status).toBe(500);
      // Hier wird der Fehler über den globalen Error-Handler (oder inline in der Route) behandelt
      expect(response.body.message).toBe("Ein Fehler ist aufgetreten");
      expect(response.body.error).toBe("Error");
    });
  });

  describe("DELETE /categories/:id", () => {
    const { token, cookieName, validId } = generateToken();

    it("should delete a category", async () => {
      (deleteCategory as jest.MockedFunction<typeof deleteCategory>).mockResolvedValue({
        id: validId,
        name: "Kategorie zum Löschen",
        description: "Beschreibung",
      });
      const response = await request(app)
        .delete(`/categories/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(204);
    });

    it("should return 404 if category not found on DELETE", async () => {
      (deleteCategory as jest.MockedFunction<typeof deleteCategory>).mockResolvedValue(null as any);
      const response = await request(app)
        .delete(`/categories/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Kategorie nicht gefunden oder bereits gelöscht" });
    });

    it("should handle errors on DELETE /categories/:id", async () => {
      (deleteCategory as jest.MockedFunction<typeof deleteCategory>).mockRejectedValue(new Error("Error"));
      const response = await request(app)
        .delete(`/categories/${validId}`)
        .set("Cookie", [`${cookieName}=${token}`]);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Fehler beim Löschen einer Kategorie");
      expect(response.body.error).toEqual({});
    });
  });
});
