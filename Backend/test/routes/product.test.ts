
import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express from "express";
import { productRouter } from "../../src/routes/product";
import { sign } from "jsonwebtoken";
import cookieParser from "cookie-parser"
import mongoose from "mongoose";

describe("Product Routes - Positive Tests", () => {
  let app: express.Express;

  beforeAll(() => {
    // Kleine Test-App erstellen und den Router mounten:
    app = express();
    app.use(express.json());
    app.use(cookieParser()); 
    app.use("/products", productRouter);
  });

  beforeAll(async () => {
    const TEST_DB_URI = process.env.TEST_DB_URI || "mongodb://localhost:27017/your_default_test_db";
    await mongoose.connect(TEST_DB_URI);
  });
  
  afterEach(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
  });
  it("should create a new product (POST /products)", async () => {
    // Beispiel-Daten für ein neues Produkt:
    const newProduct = {
      titel: "Test-Produkt",
      description: "Dies ist ein Test-Produkt",
      price: 12.99,
      images: ["image1.jpg"],
      category: "Test-Kategorie",
    };

    // Falls ihr Auth braucht, könnt ihr z. B. eine Cookie oder einen Header setzen:
    const jwtSecret = process.env.JWT_SECRET || "vjsndjvnenrjvn3nj!82429d3undCouldBeWorse!";
    const token = sign({ sub: "507f1f77bcf86cd799439011", role: "admin" }, jwtSecret, { expiresIn: "1h" });
    const cookieName = process.env.COOKIE_NAME || "access_token";
    
    const response = await request(app)
      .post("/products")
      .set("Cookie", [`${cookieName}=${token}`])
      .send(newProduct);
    
    // In einem einfachen Fall (ohne Auth):
    // const response = await request(app)
    //   .post("/products")
    //   .send(newProduct);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      titel: "Test-Produkt",
      description: "Dies ist ein Test-Produkt",
      price: 12.99,
      images: ["image1.jpg"],
      category: "Test-Kategorie",
    });
    // Ggf. weitere Checks, z. B. ob eine ID vorhanden ist:
    expect(response.body.id).toBeDefined();
  });
});
