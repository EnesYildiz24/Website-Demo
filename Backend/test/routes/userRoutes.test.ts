import dotenv from "dotenv";
dotenv.config();
import request from "supertest";
import express, { Application } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { userRouter } from "../../src/routes/user";
import { User } from "../../src/model/UserModel";
import { sign } from "jsonwebtoken";
import cookieParser from "cookie-parser";

describe("User Router CRUD Tests", () => {
  const validId = "507f1f77bcf86cd799439011";
  const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
  const cookieName = process.env.COOKIE_NAME || "access_token";
  const token = sign({ sub: validId, role: "admin" }, jwtSecret, {
    expiresIn: "1h",
  });
  let app: Application;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/users", userRouter);
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should return an empty array initially", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("should create a new user", async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const newUser = {
      username: "testuser",
      email: uniqueEmail,
      password: "secret123",
      role: "buyer",
    };
    const res = await request(app)
      .post("/users")
      .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
      .send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(uniqueEmail);
  });

  it("should retrieve a user by id", async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const newUser = {
      username: "testuser",
      email: uniqueEmail,
      password: "secret123",
      role: "buyer",
    };
    const createRes = await request(app)
      .post("/users")
      .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
      .send(newUser);
    expect(createRes.status).toBe(201);
    const userId = createRes.body.id;

    const res = await request(app).get(`/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", userId);
    expect(res.body.email).toBe(uniqueEmail);
  });

  it("should update an existing user", async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const newUser = {
      username: "testuser",
      email: uniqueEmail,
      password: "secret123",
      role: "buyer",
    };
    const createRes = await request(app)
      .post("/users")
      .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
      .send(newUser);
    expect(createRes.status).toBe(201);
    const userId = createRes.body.id;

    const updatedData = {
      username: "updateduser",
      email: uniqueEmail,
      password: "newsecret123",
      role: "seller",
    };
    const res = await request(app)
      .put(`/users/${userId}`)
      .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
      .send(updatedData);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("updateduser");
    expect(res.body.role).toBe("seller");
  });

});

