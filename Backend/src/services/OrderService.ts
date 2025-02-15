import mongoose from "mongoose";
import { logger } from "../logger";
import { Category } from "../model/CategoryModel";
import { Order } from "../model/OrderModel";
import { OrderResource } from "../Resources";

export async function createOrder(
  orderResources: OrderResource
): Promise<OrderResource> {
  try {
    const order = await Order.create({
        buyerId: new mongoose.Types.ObjectId(orderResources.buyerId),
        productId: new mongoose.Types.ObjectId(orderResources.productId),
      orderDate: orderResources.orderDate,
      status: "pending",
      paymentInfo: orderResources.paymentInfo,
    });
    return {
      id: order?._id.toString(),
      buyerId: orderResources.buyerId.toString(),
      productId: orderResources.productId.toString(),
      orderDate: order.orderDate.toISOString(),
      status: orderResources.status,
      paymentInfo: orderResources.paymentInfo,
    };
  } catch (err) {
    logger.error("Order konnte nicht erstellt werden: " + err);
    throw new Error("Order created failed: " + err);
  }
}

export async function getAllOrders(): Promise<OrderResource[]> {
  try {
    const orders = await Order.find({}).exec();
    const orderResources = orders.map((order) => ({
      id: order._id.toString(),
      buyerId: order.buyerId.toString(),
      productId: order.productId.toString(),
      orderDate: order.orderDate.toISOString(),
      status: order.status,
      paymentInfo: order.paymentInfo,
    }));
    return orderResources;
  } catch (err) {
    throw new Error("Error fetching orders: " + err);
  }
}

export async function updateOrder(
  orderResources: OrderResource
): Promise<OrderResource> {
  if (!orderResources.id) {
    throw new Error("Order id is missing, cant update it");
  }
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderResources.id },
      {
        buyerId: orderResources.buyerId,
        productId: orderResources.productId,
        orderDate: orderResources.orderDate,
        status: orderResources.status,
        paymentInfo: orderResources.paymentInfo,
      },
      { new: true }
    );
    if (!order) {
      throw new Error(`cant update the Order ${orderResources.id}`);
    }
    return {
      id: order._id.toString(),
      buyerId: order.buyerId.toString(),
      productId: order.productId.toString(),
      orderDate: order.orderDate.toISOString(),
      status: order.status,
      paymentInfo: order.paymentInfo,
    };
  } catch (err) {
    throw new Error("update Order fehlgeschlagen: " + err);
  }
}

export async function deleteOrder(orderId: string): Promise<OrderResource> {
  if (!orderId) {
    throw new Error("Order id is missing, can't delete it");
  }

  const order = await Order.findByIdAndDelete(orderId);

  if (!order) {
    throw new Error(`Can't delete the order with Id ${orderId}`);
  }

  return {
    id: order._id.toString(),
    buyerId: order.buyerId.toString(),
    productId: order.productId.toString(),
    orderDate: order.orderDate.toISOString(),
    status: order.status,
    paymentInfo: order.paymentInfo,
  };
}
