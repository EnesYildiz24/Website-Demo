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
const ProductService_1 = require("../../src/services/ProductService");
const ProductModel_1 = require("../../src/model/ProductModel");
describe("Product Service Tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect("mongodb://127.0.0.1:27017/testdb", {
            autoIndex: true,
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it("should create a product", () => __awaiter(void 0, void 0, void 0, function* () {
        const productData = {
            titel: "Test Product",
            description: "A wonderful test product",
            price: 99.99,
            images: ["img1.jpg", "img2.jpg"],
            category: "Testing",
        };
        const product = yield (0, ProductService_1.createProduct)(productData);
        expect(product).toHaveProperty("id");
        expect(product.titel).toBe(productData.titel);
        expect(product.description).toBe(productData.description);
        expect(product.price).toBe(productData.price);
        expect(product.images).toEqual(expect.arrayContaining(productData.images));
        expect(product.category).toBe(productData.category);
    }));
    it("should fetch all products", () => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield (0, ProductService_1.getAllProduct)();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBeGreaterThanOrEqual(1);
    }));
    it("should update a product", () => __awaiter(void 0, void 0, void 0, function* () {
        const productCreated = yield ProductModel_1.Product.create({
            titel: "Old Title",
            description: "Old description",
            price: 10,
            images: ["old.jpg"],
            category: "Old Category",
        });
        const updatedData = {
            id: productCreated._id.toString(),
            titel: "New Title",
            description: "New description",
            price: 20,
            images: ["new.jpg"],
            category: "New Category",
        };
        const updatedProduct = yield (0, ProductService_1.updateProduct)(updatedData);
        expect(updatedProduct.id).toBe(updatedData.id);
        expect(updatedProduct.titel).toBe("New Title");
        expect(updatedProduct.description).toBe("New description");
        expect(updatedProduct.price).toBe(20);
        expect(updatedProduct.images).toEqual(["new.jpg"]);
        expect(updatedProduct.category).toBe("New Category");
    }));
    it("should delete a product", () => __awaiter(void 0, void 0, void 0, function* () {
        const productCreated = yield ProductModel_1.Product.create({
            titel: "To Be Deleted",
            description: "This product will be deleted",
            price: 5,
            images: ["delete.jpg"],
            category: "Remove",
        });
        const deletedProduct = yield (0, ProductService_1.deleteProduct)(productCreated._id.toString());
        expect(deletedProduct.id).toBe(productCreated._id.toString());
        expect(deletedProduct.titel).toBe("To Be Deleted");
        const foundAfterDelete = yield ProductModel_1.Product.findById(productCreated._id);
        expect(foundAfterDelete).toBeNull();
    }));
});
