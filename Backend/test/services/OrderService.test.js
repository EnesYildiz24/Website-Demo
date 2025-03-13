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
const mongoose_1 = __importDefault(require("mongoose"));
const OrderModel_1 = require("../../src/model/OrderModel");
const OrderService_1 = require("../../src/services/OrderService");
describe("Order Service Tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect("mongodb://127.0.0.1:27017/testdb", {
            autoIndex: true,
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it("should create an order", () => __awaiter(void 0, void 0, void 0, function* () {
        const orderResource = {
            buyerId: new mongoose_1.default.Types.ObjectId().toString(),
            productId: new mongoose_1.default.Types.ObjectId().toString(),
            orderDate: new Date().toISOString(),
            status: "pending",
            paymentInfo: "creditcard",
        };
        const order = yield (0, OrderService_1.createOrder)(orderResource);
        expect(order).toHaveProperty("id");
        expect(order.buyerId).toBe(orderResource.buyerId);
        expect(order.productId).toBe(orderResource.productId);
        expect(typeof order.orderDate).toBe("string");
        expect(order.status).toBe("pending");
        expect(order.paymentInfo).toBe(orderResource.paymentInfo);
    }));
    it("should fetch all orders", () => __awaiter(void 0, void 0, void 0, function* () {
        const orders = yield (0, OrderService_1.getAllOrders)();
        expect(Array.isArray(orders)).toBe(true);
    }));
    it("should update an order", () => __awaiter(void 0, void 0, void 0, function* () {
        const order = yield OrderModel_1.Order.create({
            buyerId: new mongoose_1.default.Types.ObjectId(),
            productId: new mongoose_1.default.Types.ObjectId(),
            orderDate: new Date(),
            status: "pending",
            paymentInfo: "paypal",
        });
        const updatedBuyerId = new mongoose_1.default.Types.ObjectId().toString();
        const updatedProductId = new mongoose_1.default.Types.ObjectId().toString();
        const updated = yield (0, OrderService_1.updateOrder)({
            id: order._id.toString(),
            buyerId: updatedBuyerId,
            productId: updatedProductId,
            orderDate: new Date("2025-02-14T00:00:00Z").toISOString(),
            status: "completed",
            paymentInfo: "creditcard",
        });
        expect(updated.buyerId).toBe(updatedBuyerId);
        expect(updated.productId).toBe(updatedProductId);
        expect(updated.status).toBe("completed");
        expect(updated.paymentInfo).toBe("creditcard");
        expect(new Date(updated.orderDate).toISOString()).toBe(new Date("2025-02-14T00:00:00Z").toISOString());
    }));
    it("should delete an order", () => __awaiter(void 0, void 0, void 0, function* () {
        const order = yield OrderModel_1.Order.create({
            buyerId: new mongoose_1.default.Types.ObjectId().toString(),
            productId: new mongoose_1.default.Types.ObjectId().toString(),
            orderDate: new Date(),
            status: "pending",
            paymentInfo: "invoice",
        });
        const deleted = yield (0, OrderService_1.deleteOrder)(order._id.toString());
        expect(deleted.id).toBe(order._id.toString());
        expect(deleted.buyerId).toBe(order.buyerId.toString());
        expect(deleted.productId).toBe(order.productId.toString());
        expect(deleted.paymentInfo).toBe(order.paymentInfo);
    }));
});
