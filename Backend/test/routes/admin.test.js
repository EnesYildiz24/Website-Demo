"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const admin_1 = require("../../src/routes/admin");
const jsonwebtoken_1 = require("jsonwebtoken");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
describe("Admin Routes - Full CRUD", () => {
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.use("/admins", admin_1.adminRouter);
    });
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const TEST_DB_URI = process.env.TEST_DB_URI || "mongodb://localhost:27017/your_default_test_db";
        yield mongoose_1.default.connect(TEST_DB_URI);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.db) {
            yield mongoose_1.default.connection.db.dropDatabase();
        }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
    }));
    const generateAdminToken = () => {
        const jwtSecret = process.env.JWT_SECRET || "fallbackSecret";
        const token = (0, jsonwebtoken_1.sign)({ sub: "507f1f77bcf86cd799439011", role: "admin" }, jwtSecret, { expiresIn: "1h" });
        const cookieName = process.env.COOKIE_NAME || "access_token";
        return { token, cookieName };
    };
    it("should create a new admin (POST /admins)", () => __awaiter(void 0, void 0, void 0, function* () {
        const newAdmin = {
            username: "testadmin",
            email: "testadmin@example.com",
            password: "password123",
            role: "admin",
            permissions: ["read", "write"],
        };
        const { token, cookieName } = generateAdminToken();
        const response = yield (0, supertest_1.default)(app)
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
    }));
    it("should get all admins (GET /admins)", () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield (0, supertest_1.default)(app)
            .post("/admins")
            .set("Cookie", [`${cookieName}=${token}`])
            .send(admin1);
        yield (0, supertest_1.default)(app)
            .post("/admins")
            .set("Cookie", [`${cookieName}=${token}`])
            .send(admin2);
        const response = yield (0, supertest_1.default)(app).get("/admins");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
    }));
    it("should get an admin by id (GET /admins/:id)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { token, cookieName } = generateAdminToken();
        const newAdmin = {
            username: "adminGet",
            email: "adminget@example.com",
            password: "password123",
            role: "admin",
            permissions: ["read", "write", "delete"],
        };
        const postResponse = yield (0, supertest_1.default)(app)
            .post("/admins")
            .set("Cookie", [`${cookieName}=${token}`])
            .send(newAdmin);
        const adminId = postResponse.body.id;
        const response = yield (0, supertest_1.default)(app).get(`/admins/${adminId}`);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe("adminGet");
    }));
    it("should update an admin (PUT /admins/:id)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { token, cookieName } = generateAdminToken();
        const newAdmin = {
            username: "adminUpdate",
            email: "adminupdate@example.com",
            password: "password123",
            role: "admin",
            permissions: ["read"],
        };
        const postResponse = yield (0, supertest_1.default)(app)
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
        const response = yield (0, supertest_1.default)(app)
            .put(`/admins/${adminId}`)
            .set("Cookie", [`${cookieName}=${token}`])
            .send(updatedData);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe("adminUpdated");
        expect(response.body.email).toBe("updated@example.com");
        expect(response.body.permissions).toEqual(["read", "update"]);
    }));
    it("should delete an admin (DELETE /admins/:id)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { token, cookieName } = generateAdminToken();
        const newAdmin = {
            username: "adminDelete",
            email: "admindelete@example.com",
            password: "password123",
            role: "admin",
            permissions: ["read", "write"],
        };
        const postResponse = yield (0, supertest_1.default)(app)
            .post("/admins")
            .set("Cookie", [`${cookieName}=${token}`])
            .send(newAdmin);
        const adminId = postResponse.body.id;
        const deleteResponse = yield (0, supertest_1.default)(app)
            .delete(`/admins/${adminId}`)
            .set("Cookie", [`${cookieName}=${token}`]);
        expect(deleteResponse.status).toBe(204);
        const getResponse = yield (0, supertest_1.default)(app).get(`/admins/${adminId}`);
        expect(getResponse.status).toBe(404);
    }));
});
