import mongoose from "mongoose";
import {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
} from "../../src/services/ProductService";
import { Product } from "../../src/model/ProductModel";

describe("Product Service Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
      autoIndex: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should create a product", async () => {
    const productData = {
      titel: "Test Product",
      description: "A wonderful test product",
      price: 99.99,
      images: ["img1.jpg", "img2.jpg"],
      category: "Testing",
    };

    const product = await createProduct(productData);
    expect(product).toHaveProperty("id");
    expect(product.titel).toBe(productData.titel);
    expect(product.description).toBe(productData.description);
    expect(product.price).toBe(productData.price);
    expect(product.images).toEqual(expect.arrayContaining(productData.images));
    expect(product.category).toBe(productData.category);
  });

  it("should fetch all products", async () => {
    await Product.create({
      titel: "Sample Product",
      description: "Sample description",
      price: 10,
      images: ["sample.jpg"],
      category: "Sample Category",
    });

    const products = await getAllProduct();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a product", async () => {
    const productCreated = await Product.create({
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

    const updatedProduct = await updateProduct(updatedData);
    expect(updatedProduct.id).toBe(updatedData.id);
    expect(updatedProduct.titel).toBe("New Title");
    expect(updatedProduct.description).toBe("New description");
    expect(updatedProduct.price).toBe(20);
    expect(updatedProduct.images).toEqual(["new.jpg"]);
    expect(updatedProduct.category).toBe("New Category");
  });

  it("should delete a product", async () => {
    const productCreated = await Product.create({
      titel: "To Be Deleted",
      description: "This product will be deleted",
      price: 5,
      images: ["delete.jpg"],
      category: "Remove",
    });

    const deletedProduct = await deleteProduct(productCreated._id.toString());
    expect(deletedProduct.id).toBe(productCreated._id.toString());
    expect(deletedProduct.titel).toBe("To Be Deleted");

    const foundAfterDelete = await Product.findById(productCreated._id);
    expect(foundAfterDelete).toBeNull();
  });
});
