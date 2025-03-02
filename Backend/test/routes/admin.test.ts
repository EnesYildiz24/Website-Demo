import request from "supertest";
import express from "express";
import { adminRouter } from "../../src/routes/admin";
import { sign } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

describe("Admin Routes - Full CRUD", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/admins", adminRouter);
  });

  beforeAll(async () => {
    const TEST_DB_URI =
      process.env.TEST_DB_URI || "mongodb://localhost:27017/your_default_test_db";
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
  const generateAdminToken = () => {
    const jwtSecret = process.env.JWT_SECRET || "fallbackSecret";
    const token = sign({ sub: "507f1f77bcf86cd799439011", role: "admin" }, jwtSecret, { expiresIn: "1h" });
    const cookieName = process.env.COOKIE_NAME || "access_token";
    return { token, cookieName };
  };

  it("should create a new admin (POST /admins)", async () => {
    const newAdmin = {
      username: "testadmin",
      email: "testadmin@example.com",
      password: "password123",
      role: "admin",
      permissions: ["read", "write"],
    };

    const { token, cookieName } = generateAdminToken();
    const response = await request(app)
      .post("/admins")
      .set("Cookie", [`${cookieName}=${token}`])
      .send(newAdmin);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      username: "testadmin",
      email: "testadmin@example.com",
      role: "admin",
      permissions: ["read", "write"],
    });
    expect(response.body.id).toBeDefined();
  });

  it("should get all admins (GET /admins)", async () => {
    const { token, cookieName } = generateAdminToken();

    const admin1 = {
      username: "admin1",
      email: "admin1@example.com",
      password: "password123",
      role: "admin",
      permissions: ["read"],
    };
    const admin2 = {
      username: "admin2",
      email: "admin2@example.com",
      password: "password123",
      role: "admin",
      permissions: ["read", "write"],
    };

    await request(app)
      .post("/admins")
      .set("Cookie", [`${cookieName}=${token}`])
      .send(admin1);

    await request(app)
      .post("/admins")
      .set("Cookie", [`${cookieName}=${token}`])
      .send(admin2);

    const response = await request(app).get("/admins");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });

  it("should get an admin by id (GET /admins/:id)", async () => {
    const { token, cookieName } = generateAdminToken();

    const newAdmin = {
      username: "adminGet",
      email: "adminget@example.com",
      password: "password123",
      role: "admin",
      permissions: ["read", "write", "delete"],
    };

    const postResponse = await request(app)
      .post("/admins")
      .set("Cookie", [`${cookieName}=${token}`])
      .send(newAdmin);

    const adminId = postResponse.body.id;
    const response = await request(app).get(`/admins/${adminId}`);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe("adminGet");
  });

  it("should update an admin (PUT /admins/:id)", async () => {
    const { token, cookieName } = generateAdminToken();

    const newAdmin = {
      username: "adminUpdate",
      email: "adminupdate@example.com",
      password: "password123",
      role: "admin",
      permissions: ["read"],
    };

    const postResponse = await request(app)
      .post("/admins")
      .set("Cookie", [`${cookieName}=${token}`])
      .send(newAdmin);
    const adminId = postResponse.body.id;

    const updatedData = {
      username: "adminUpdated",
      email: "updated@example.com",
      password: "newpassword123",
      role: "admin", 
      permissions: ["read", "update"],
    };

    const response = await request(app)
      .put(`/admins/${adminId}`)
      .set("Cookie", [`${cookieName}=${token}`])
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe("adminUpdated");
    expect(response.body.email).toBe("updated@example.com");
    expect(response.body.permissions).toEqual(["read", "update"]);
  });

  it("should delete an admin (DELETE /admins/:id)", async () => {
    const { token, cookieName } = generateAdminToken();

    const newAdmin = {
      username: "adminDelete",
      email: "admindelete@example.com",
      password: "password123",
      role: "admin",
      permissions: ["read", "write"],
    };

    const postResponse = await request(app)
      .post("/admins")
      .set("Cookie", [`${cookieName}=${token}`])
      .send(newAdmin);
    const adminId = postResponse.body.id;

    const deleteResponse = await request(app)
      .delete(`/admins/${adminId}`)
      .set("Cookie", [`${cookieName}=${token}`]);
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/admins/${adminId}`);
    expect(getResponse.status).toBe(404);
  });
});
