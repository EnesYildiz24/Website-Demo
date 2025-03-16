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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const user_1 = require("../../src/routes/user");
const UserModel_1 = require("../../src/model/UserModel");
const jsonwebtoken_1 = require("jsonwebtoken");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
describe("User Router CRUD Tests", () => {
    const validId = "507f1f77bcf86cd799439011";
    const jwtSecret = process.env.JWT_SECRET || "defaultSecret";
    const cookieName = process.env.COOKIE_NAME || "access_token";
    const token = (0, jsonwebtoken_1.sign)({ sub: validId, role: "admin" }, jwtSecret, {
        expiresIn: "1h",
    });
    let app;
    let mongoServer;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        yield mongoose_1.default.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.use("/users", user_1.userRouter);
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield UserModel_1.User.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield mongoServer.stop();
    }));
    it("should return an empty array initially", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app).get("/users");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    }));
    it("should create a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        const newUser = {
            username: "testuser",
            email: uniqueEmail,
            password: "secret123",
            role: "buyer",
        };
        const res = yield (0, supertest_1.default)(app)
            .post("/users")
            .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
            .send(newUser);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.email).toBe(uniqueEmail);
    }));
    it("should retrieve a user by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        const newUser = {
            username: "testuser",
            email: uniqueEmail,
            password: "secret123",
            role: "buyer",
        };
        const createRes = yield (0, supertest_1.default)(app)
            .post("/users")
            .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
            .send(newUser);
        expect(createRes.status).toBe(201);
        const userId = createRes.body.id;
        const res = yield (0, supertest_1.default)(app).get(`/users/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", userId);
        expect(res.body.email).toBe(uniqueEmail);
    }));
    it("should update an existing user", () => __awaiter(void 0, void 0, void 0, function* () {
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        const newUser = {
            username: "testuser",
            email: uniqueEmail,
            password: "secret123",
            role: "buyer",
        };
        const createRes = yield (0, supertest_1.default)(app)
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
        const res = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set("Cookie", [`${cookieName}=${token}`]) // Token hier mitsenden
            .send(updatedData);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe("updateduser");
        expect(res.body.role).toBe("seller");
    }));
});
