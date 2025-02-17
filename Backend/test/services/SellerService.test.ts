// tests/SellerService.test.ts

import mongoose from "mongoose";
import { Seller } from "../../src/model/SellerModel";
import {
  createSeller,
  getAllSeller,
  updateSeller,
  deleteSeller,
} from "../../src/services/SellerService";

// Optional: importiere dein logger-Objekt, falls du es prüfen möchtest
// import { logger } from "../../src/logger";

describe("Seller Service Tests", () => {
  // Vor allen Tests mit der Test-Datenbank verbinden
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
      autoIndex: true,
    });
  });

  // Nach allen Tests DB-Daten löschen und Verbindung schließen
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  it("should create a seller", async () => {
    const sellerResource = {
      username: "testseller",
      email: "seller@example.com",
      password: "sellerpass",
      role: "seller" as const,
      shopName: "Test Shop",
      contactInfo: "Phone: 1234-5678",
      // evtl. rating: 5
    };

    const seller = await createSeller(sellerResource);

    expect(seller).toHaveProperty("id");
    expect(seller.username).toBe("testseller");
    expect(seller.email).toBe("seller@example.com");
    expect(seller.role).toBe("seller");
    // Falls du shopName und contactInfo in der Rückgabe hast, prüfe sie hier auch
    expect(seller.shopName).toBe("Test Shop");
    expect(seller.contactInfo).toBe("Phone: 1234-5678");
  });

  it("should fetch all sellers", async () => {
    // Erstelle einen zweiten Seller direkt via Modell,
    // damit wir mind. 2 Seller in der Datenbank haben
    await Seller.create({
      username: "secondseller",
      email: "secondseller@example.com",
      password: "secondpass",
      role: "seller",
      shopName: "Shop2",
      contactInfo: "123-456-789",
      rating: 5,
    });

    const sellers = await getAllSeller();
    expect(Array.isArray(sellers)).toBe(true);
    expect(sellers.length).toBeGreaterThanOrEqual(1);

    // Optional: Prüfe, ob "secondseller" enthalten ist
    const found = sellers.some((s) => s.username === "secondseller");
    expect(found).toBe(true);
  });

  it("should update a seller", async () => {
    const existingSeller = await Seller.create({
      username: "oldseller",
      email: "oldseller@example.com",
      password: "oldpass",
      role: "seller",
      shopName: "Old Shop",
      contactInfo: "Old Contact Info",
    });

    const updatedSeller = await updateSeller({
      id: existingSeller._id.toString(),
      username: "newSellerName",
      email: "newSeller@example.com",
      password: "newpass",
      role: "seller" as const,
      shopName: "New Shop", // Hier ergänzen
      contactInfo: "New Contact Info", // Hier ergänzen
    });

    expect(updatedSeller.username).toBe("newSellerName");
    expect(updatedSeller.email).toBe("newSeller@example.com");
    expect(updatedSeller.role).toBe("seller");
    expect(updatedSeller.shopName).toBe("New Shop");
    expect(updatedSeller.contactInfo).toBe("New Contact Info");
  });

  it("should delete a seller", async () => {
    const sellerToDelete = await Seller.create({
      username: "deleteSeller",
      email: "deleteSeller@example.com",
      password: "deletepass",
      role: "seller",
      shopName: "Delete Shop",
      contactInfo: "Contact Delete",
    });

    const deletedSeller = await deleteSeller(sellerToDelete._id.toString());

    expect(deletedSeller.id).toBe(sellerToDelete._id.toString());
    expect(deletedSeller.username).toBe("deleteSeller");
    expect(deletedSeller.email).toBe("deleteSeller@example.com");
    expect(deletedSeller.role).toBe("seller");

    const checkSeller = await Seller.findById(sellerToDelete._id);
    expect(checkSeller).toBeNull();
  });
});
