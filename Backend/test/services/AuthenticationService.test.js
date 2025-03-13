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
const UserModel_1 = require("../../src/model/UserModel");
const AuthenticationService_1 = require("../../src/services/AuthenticationService");
const UserService_1 = require("../../src/services/UserService");
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    yield mongoose_1.default.connect(uri);
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongoServer.stop();
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield UserModel_1.User.deleteMany({});
}));
test("AuthenticationService test", () => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = {
        username: "klinski",
        email: "1234@example.com",
        password: "1111",
        role: "admin",
    };
    const createdUser = yield (0, UserService_1.createUser)(newUser);
    const findUser = yield UserModel_1.User.findById(createdUser.id).exec();
    if (!findUser) {
        throw new Error("User wurde nicht gefunden");
    }
    const result = yield (0, AuthenticationService_1.login)(findUser.email, "1111");
    expect(result).toBeTruthy();
    expect(findUser.password).not.toBe("1111");
    expect(createdUser.password).not.toBe("1111");
    expect(newUser.password).toBe("1111");
    expect(result).toEqual({
        id: createdUser.id,
        role: createdUser.role,
    });
}));
test("AuthenticationService test admin was false", () => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = {
        username: "klinski",
        email: "1234@example.com",
        password: "1111",
        role: "buyer",
    };
    const createdUser = yield (0, UserService_1.createUser)(newUser);
    const findUser = yield UserModel_1.User.findById(createdUser.id).exec();
    if (!findUser) {
        throw new Error("User wurde nicht gefunden");
    }
    const result = yield (0, AuthenticationService_1.login)(findUser.email, "1111");
    expect(result).toBeTruthy();
    expect(result).toEqual({
        id: createdUser.id,
        role: createdUser.role,
    });
}));
test("hashed password must be false", () => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = {
        username: "klinski",
        email: "1234@example.com",
        password: "1111",
        role: "buyer",
    };
    const createdUser = yield (0, UserService_1.createUser)(newUser);
    const findUser = yield UserModel_1.User.findById(createdUser.id).exec();
    if (!findUser) {
        throw new Error("User wurde nicht gefunden");
    }
    try {
        yield (0, AuthenticationService_1.login)(findUser.email, findUser.password);
        throw new Error("Gehashtes Passwort sollte nicht akzeptiert werden");
    }
    catch (err) {
        expect(err).toBeTruthy();
    }
}));
test("AuthenticationService test email failed", () => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = {
        username: "klinski",
        email: "1234@example.com",
        password: "1111",
        role: "admin",
    };
    try {
        yield (0, AuthenticationService_1.login)("falsche@example.com", newUser.password);
    }
    catch (err) {
        expect(err).toBeTruthy();
    }
}));
test("AuthenticationService test password not found", () => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = {
        username: "klinski",
        email: "1234@example.com",
        password: undefined,
        role: "admin",
    };
    try {
        yield (0, AuthenticationService_1.login)(newUser.email, newUser.password);
    }
    catch (err) {
        expect(err).toBeTruthy();
    }
}));
