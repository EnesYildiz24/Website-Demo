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
Object.defineProperty(exports, "__esModule", { value: true });
const JWTService_1 = require("../../src/services/JWTService");
const AuthenticationService_1 = require("../../src/services/AuthenticationService");
const jsonwebtoken_1 = require("jsonwebtoken");
jest.mock("../../src/services/AuthenticationService");
describe("JWTService", () => {
    const mockLogin = jest.spyOn(AuthenticationService_1, 'login');
    beforeEach(() => {
        process.env.JWT_SECRET = "test_secret";
        process.env.JWT_TTL = "3600";
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should create JWT for valid user", () => __awaiter(void 0, void 0, void 0, function* () {
        mockLogin.mockResolvedValue({ id: "123", role: "admin" });
        const jwt = yield (0, JWTService_1.verifyPasswordAndCreateJWT)("test@example.com", "password");
        expect(jwt).toBeDefined();
    }));
    test("should throw error for invalid JWT_SECRET", () => __awaiter(void 0, void 0, void 0, function* () {
        process.env.JWT_SECRET = "";
        yield expect((0, JWTService_1.verifyPasswordAndCreateJWT)("test@example.com", "password")).rejects.toThrow("JWT_SECRET oder JWT_TTL nicht gegeben");
    }));
    test("should verify valid JWT", () => {
        const jwt = (0, jsonwebtoken_1.sign)({ sub: "123", role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const result = (0, JWTService_1.verifyJWT)(jwt);
        expect(result).toEqual({ id: "123", role: "admin", exp: expect.any(Number) });
    });
    test("should throw error for invalid JWT", () => {
        expect(() => (0, JWTService_1.verifyJWT)("invalid_jwt")).toThrow(jsonwebtoken_1.JsonWebTokenError);
    });
});
