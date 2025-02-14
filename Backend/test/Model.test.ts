import mongoose from "mongoose";
import { User } from "../model/UserModel";
import { Admin } from "../model/AdminModel";
import { Seller } from "../model/SellerModel";
import { Buyer } from "../model/BuyerModel";
import { Product } from "../model/ProductModel";
import { Order } from "../model/OrderModel";
import { Review } from "../model/ReviewModel";
import { Category } from "../model/CategoryModel";


describe("Mongoose Model Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
      autoIndex: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("sollte einen User erstellen können", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "12345",
      role: "buyer",
    });

    expect(user._id).toBeDefined();
    expect(user.username).toBe("testuser");
    expect(user.role).toBe("buyer");
  });

  it("sollte einen Admin erstellen können (Discriminator)", async () => {
    const admin = await Admin.create({
      username: "adminuser",
      email: "admin@example.com",
      password: "adminpass",
      permissions: ["MANAGE_USERS", "MANAGE_PRODUCTS"],
    });

    expect(admin._id).toBeDefined();
    expect(admin.username).toBe("adminuser");
    expect(admin.permissions).toContain("MANAGE_USERS");
  });

  it("sollte einen Seller erstellen können (Discriminator)", async () => {
    const seller = await Seller.create({
      username: "sellerguy",
      email: "seller@example.com",
      password: "sellpass",
      shopName: "MyGameShop",
      rating: 5,
      contactInfo: "contact@sellerguy.com",
    });

    expect(seller._id).toBeDefined();
    expect(seller.shopName).toBe("MyGameShop");
  });

  it("sollte einen Buyer erstellen können (Discriminator)", async () => {
    const buyer = await Buyer.create({
      username: "buyergirl",
      email: "buyer@example.com",
      password: "buypass",
      shippingAddress: "123 Buyer Street",
      paymentMethods: "PayPal",
    });

    expect(buyer._id).toBeDefined();
    expect(buyer.shippingAddress).toBe("123 Buyer Street");
  });

  it("sollte eine Category erstellen können", async () => {
    const category = await Category.create({
      name: "Action",
      description: "Action-Spiele",
    });

    expect(category._id).toBeDefined();
    expect(category.name).toBe("Action");
  });

  it("sollte ein Product erstellen können", async () => {
    const product = await Product.create({
      titel: "Battle Game",
      description: "Ein spannendes Action-Spiel",
      price: 59.99,
      images: ["img1.jpg", "img2.jpg"],
      category: "Action",
    });

    expect(product._id).toBeDefined();
    expect(product.titel).toBe("Battle Game");
  });

  it("sollte eine Order erstellen können", async () => {
    // Zuerst einen Buyer und ein Product erstellen
    const buyer = await Buyer.create({
      username: "testbuyer",
      email: "testbuyer@example.com",
      password: "buypass",
    });

    const product = await Product.create({
      titel: "Puzzle Game",
      description: "Ein kniffliges Puzzle-Spiel",
      price: 19.99,
      images: [],
      category: "Puzzle",
    });

    // Jetzt die Order anlegen
    const order = await Order.create({
      buyerId: buyer._id,
      productId: product._id,
      paymentInfo: "VISA 1234",
    });

    expect(order._id).toBeDefined();
    expect(order.status).toBe("pending");
  });

  it("sollte ein Review erstellen können", async () => {
    // Seller anlegen
    const seller = await Seller.create({
      username: "reviewSeller",
      email: "seller2@example.com",
      password: "sellpass2",
      shopName: "ReviewShop",
      contactInfo: "contact@reviewshop.com",
    });

    // Produkt anlegen
    const product = await Product.create({
      titel: "Review Game",
      description: "Spiel zum Bewerten",
      price: 29.99,
      images: [],
      category: "Action",
    });

    // Buyer anlegen
    const buyer = await Buyer.create({
      username: "reviewBuyer",
      email: "buyer2@example.com",
      password: "buypass2",
    });

    // Review erstellen
    const review = await Review.create({
      reviewerId: buyer._id,
      productId: product._id,
      sellerId: seller._id,
      rating: 4,
      comment: "Gutes Spiel, aber könnte besser sein.",
    });

    expect(review._id).toBeDefined();
    expect(review.rating).toBe(4);
  });
});
