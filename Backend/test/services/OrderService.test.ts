import mongoose from "mongoose";
import { Order } from "../../src/model/OrderModel";
import {
  createOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../../src/services/OrderService";

describe("Order Service Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb", {
      autoIndex: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should create an order", async () => {
    const orderResource = {
      buyerId: new mongoose.Types.ObjectId().toString(),
      productId: new mongoose.Types.ObjectId().toString(), 
      orderDate: new Date().toISOString(),
      status: "pending",
      paymentInfo: "creditcard",
    };

    const order = await createOrder(orderResource);
    expect(order).toHaveProperty("id");
    expect(order.buyerId).toBe(orderResource.buyerId);
    expect(order.productId).toBe(orderResource.productId);
    expect(typeof order.orderDate).toBe("string");
    expect(order.status).toBe("pending");
    expect(order.paymentInfo).toBe(orderResource.paymentInfo);
  });

  it("should fetch all orders", async () => {
    const orders = await getAllOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should update an order", async () => {
    const order = await Order.create({
      buyerId: new mongoose.Types.ObjectId(), 
      productId: new mongoose.Types.ObjectId(),
      orderDate: new Date(),
      status: "pending",
      paymentInfo: "paypal",
    });

    const updatedBuyerId = new mongoose.Types.ObjectId().toString();
    const updatedProductId = new mongoose.Types.ObjectId().toString();

    const updated = await updateOrder({
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
    expect(new Date(updated.orderDate).toISOString()).toBe(
      new Date("2025-02-14T00:00:00Z").toISOString()
    );
  });

  it("should delete an order", async () => {
    const order = await Order.create({
      buyerId: new mongoose.Types.ObjectId().toString(),
      productId: new mongoose.Types.ObjectId().toString(),
      orderDate: new Date(),
      status: "pending",
      paymentInfo: "invoice",
    });

    const deleted = await deleteOrder(order._id.toString());
    expect(deleted.id).toBe(order._id.toString());
    expect(deleted.buyerId).toBe(order.buyerId.toString());
    expect(deleted.productId).toBe(order.productId.toString());
    expect(deleted.paymentInfo).toBe(order.paymentInfo);
  });
});
