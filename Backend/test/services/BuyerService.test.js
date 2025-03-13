"use strict";
// tests/BuyerService.test.ts
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
const mongoose_1 = __importDefault(require("mongoose"));
const BuyerModel_1 = require("../../src/model/BuyerModel");
const BuyerService_1 = require("../../src/services/BuyerService");
describe("Buyer Service Tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect("mongodb://127.0.0.1:27017/testdb", {
            autoIndex: true,
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it("should create a buyer", () => __awaiter(void 0, void 0, void 0, function* () {
        const buyerResource = {
            username: "testbuyer",
            email: "buyer@example.com",
            password: "buyerpass",
            role: "buyer",
        };
        const buyer = yield (0, BuyerService_1.createBuyer)(buyerResource);
        expect(buyer).toHaveProperty("id");
        expect(buyer.username).toBe("testbuyer");
        expect(buyer.email).toBe("buyer@example.com");
        expect(buyer.role).toBe("buyer");
    }));
    it("should fetch all buyers", () => __awaiter(void 0, void 0, void 0, function* () {
        yield BuyerModel_1.Buyer.create({
            username: "secondbuyer",
            email: "secondbuyer@example.com",
            password: "secondpass",
            role: "buyer",
        });
        const buyers = yield (0, BuyerService_1.getAllBuyers)();
        expect(Array.isArray(buyers)).toBe(true);
        expect(buyers.length).toBeGreaterThanOrEqual(1);
        const found = buyers.some((b) => b.username === "secondbuyer");
        expect(found).toBe(true);
    }));
    it("should update a buyer", () => __awaiter(void 0, void 0, void 0, function* () {
        const existingBuyer = yield BuyerModel_1.Buyer.create({
            username: "oldbuyer",
            email: "oldbuyer@example.com",
            password: "oldpass",
            role: "buyer",
        });
        const updatedData = {
            id: existingBuyer._id.toString(),
            username: "newbuyer",
            email: "newbuyer@example.com",
            password: "newpass",
            role: "buyer",
        };
        const updatedBuyer = yield (0, BuyerService_1.updateBuyer)(updatedData);
        expect(updatedBuyer.username).toBe("newbuyer");
        expect(updatedBuyer.email).toBe("newbuyer@example.com");
        expect(updatedBuyer.role).toBe("buyer");
    }));
    it("should delete a buyer", () => __awaiter(void 0, void 0, void 0, function* () {
        const buyerToDelete = yield BuyerModel_1.Buyer.create({
            username: "deletebuyer",
            email: "deletebuyer@example.com",
            password: "deletepass",
            role: "buyer",
        });
        const deletedBuyer = yield (0, BuyerService_1.deleteBuyer)(buyerToDelete._id.toString());
        expect(deletedBuyer.id).toBe(buyerToDelete._id.toString());
        expect(deletedBuyer.username).toBe("deletebuyer");
        expect(deletedBuyer.email).toBe("deletebuyer@example.com");
        expect(deletedBuyer.role).toBe("buyer");
        const checkBuyer = yield BuyerModel_1.Buyer.findById(buyerToDelete._id);
        expect(checkBuyer).toBeNull();
    }));
});
