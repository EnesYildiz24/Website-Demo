// tests/BuyerService.test.ts

import mongoose from "mongoose";
import { Buyer } from "../../src/model/BuyerModel";
import {
  createBuyer,
  getAllBuyers,
  updateBuyer,
  deleteBuyer,
} from "../../src/services/BuyerService";

describe("Buyer Service Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
      autoIndex: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should create a buyer", async () => {
    const buyerResource = {
      username: "testbuyer",
      email: "buyer@example.com",
      password: "buyerpass",
      role: "buyer" as const,
    };

    const buyer = await createBuyer(buyerResource);

    expect(buyer).toHaveProperty("id");
    expect(buyer.username).toBe("testbuyer");
    expect(buyer.email).toBe("buyer@example.com");
    expect(buyer.role).toBe("buyer");
  });

  it("should fetch all buyers", async () => {
    await Buyer.create({
      username: "secondbuyer",
      email: "secondbuyer@example.com",
      password: "secondpass",
      role: "buyer",
    });

    const buyers = await getAllBuyers();
    expect(Array.isArray(buyers)).toBe(true);
    expect(buyers.length).toBeGreaterThanOrEqual(1);

    const found = buyers.some((b) => b.username === "secondbuyer");
    expect(found).toBe(true);
  });

  it("should update a buyer", async () => {
    const existingBuyer = await Buyer.create({
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
      role: "buyer" as const, 
    };

    const updatedBuyer = await updateBuyer(updatedData);

    expect(updatedBuyer.username).toBe("newbuyer");
    expect(updatedBuyer.email).toBe("newbuyer@example.com");
    expect(updatedBuyer.role).toBe("buyer");
  });

  it("should delete a buyer", async () => {
    const buyerToDelete = await Buyer.create({
      username: "deletebuyer",
      email: "deletebuyer@example.com",
      password: "deletepass",
      role: "buyer",
    });

    const deletedBuyer = await deleteBuyer(buyerToDelete._id.toString());

    expect(deletedBuyer.id).toBe(buyerToDelete._id.toString());
    expect(deletedBuyer.username).toBe("deletebuyer");
    expect(deletedBuyer.email).toBe("deletebuyer@example.com");
    expect(deletedBuyer.role).toBe("buyer");

    const checkBuyer = await Buyer.findById(buyerToDelete._id);
    expect(checkBuyer).toBeNull();
  });
});
