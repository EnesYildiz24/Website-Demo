"use strict";
// tests/SellerService.test.ts
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
const SellerModel_1 = require("../../src/model/SellerModel");
const SellerService_1 = require("../../src/services/SellerService");
// Optional: importiere dein logger-Objekt, falls du es prüfen möchtest
// import { logger } from "../../src/logger";
describe("Seller Service Tests", () => {
    // Vor allen Tests mit der Test-Datenbank verbinden
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect("mongodb://127.0.0.1:27017/testdb", {
            autoIndex: true,
        });
    }));
    // Nach allen Tests DB-Daten löschen und Verbindung schließen
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.connection.close();
    }));
    it("should create a seller", () => __awaiter(void 0, void 0, void 0, function* () {
        const sellerResource = {
            username: "testseller",
            email: "seller@example.com",
            password: "sellerpass",
            role: "seller",
            shopName: "Test Shop",
            contactInfo: "Phone: 1234-5678",
            // evtl. rating: 5
        };
        const seller = yield (0, SellerService_1.createSeller)(sellerResource);
        expect(seller).toHaveProperty("id");
        expect(seller.username).toBe("testseller");
        expect(seller.email).toBe("seller@example.com");
        expect(seller.role).toBe("seller");
        // Falls du shopName und contactInfo in der Rückgabe hast, prüfe sie hier auch
        expect(seller.shopName).toBe("Test Shop");
        expect(seller.contactInfo).toBe("Phone: 1234-5678");
    }));
    it("should fetch all sellers", () => __awaiter(void 0, void 0, void 0, function* () {
        // Erstelle einen zweiten Seller direkt via Modell,
        // damit wir mind. 2 Seller in der Datenbank haben
        yield SellerModel_1.Seller.create({
            username: "secondseller",
            email: "secondseller@example.com",
            password: "secondpass",
            role: "seller",
            shopName: "Shop2",
            contactInfo: "123-456-789",
            rating: 5,
        });
        const sellers = yield (0, SellerService_1.getAllSeller)();
        expect(Array.isArray(sellers)).toBe(true);
        expect(sellers.length).toBeGreaterThanOrEqual(1);
        // Optional: Prüfe, ob "secondseller" enthalten ist
        const found = sellers.some((s) => s.username === "secondseller");
        expect(found).toBe(true);
    }));
    it("should update a seller", () => __awaiter(void 0, void 0, void 0, function* () {
        const existingSeller = yield SellerModel_1.Seller.create({
            username: "oldseller",
            email: "oldseller@example.com",
            password: "oldpass",
            role: "seller",
            shopName: "Old Shop",
            contactInfo: "Old Contact Info",
        });
        const updatedSeller = yield (0, SellerService_1.updateSeller)({
            id: existingSeller._id.toString(),
            username: "newSellerName",
            email: "newSeller@example.com",
            password: "newpass",
            role: "seller",
            shopName: "New Shop", // Hier ergänzen
            contactInfo: "New Contact Info", // Hier ergänzen
        });
        expect(updatedSeller.username).toBe("newSellerName");
        expect(updatedSeller.email).toBe("newSeller@example.com");
        expect(updatedSeller.role).toBe("seller");
        expect(updatedSeller.shopName).toBe("New Shop");
        expect(updatedSeller.contactInfo).toBe("New Contact Info");
    }));
    it("should delete a seller", () => __awaiter(void 0, void 0, void 0, function* () {
        const sellerToDelete = yield SellerModel_1.Seller.create({
            username: "deleteSeller",
            email: "deleteSeller@example.com",
            password: "deletepass",
            role: "seller",
            shopName: "Delete Shop",
            contactInfo: "Contact Delete",
        });
        const deletedSeller = yield (0, SellerService_1.deleteSeller)(sellerToDelete._id.toString());
        expect(deletedSeller.id).toBe(sellerToDelete._id.toString());
        expect(deletedSeller.username).toBe("deleteSeller");
        expect(deletedSeller.email).toBe("deleteSeller@example.com");
        expect(deletedSeller.role).toBe("seller");
        const checkSeller = yield SellerModel_1.Seller.findById(sellerToDelete._id);
        expect(checkSeller).toBeNull();
    }));
});
