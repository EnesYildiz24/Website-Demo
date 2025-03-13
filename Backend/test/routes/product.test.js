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
const product_1 = require("../../src/routes/product");
const jsonwebtoken_1 = require("jsonwebtoken");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
describe("Product Routes - Positive Tests", () => {
    let app;
    beforeAll(() => {
        // Kleine Test-App erstellen und den Router mounten:
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)());
        app.use("/products", product_1.productRouter);
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
    it("should create a new product (POST /products)", () => __awaiter(void 0, void 0, void 0, function* () {
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
        const token = (0, jsonwebtoken_1.sign)({ sub: "507f1f77bcf86cd799439011", role: "admin" }, jwtSecret, { expiresIn: "1h" });
        const cookieName = process.env.COOKIE_NAME || "access_token";
        const response = yield (0, supertest_1.default)(app)
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
    }));
});
