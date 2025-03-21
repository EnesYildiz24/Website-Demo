import { Types } from "mongoose";
import { Order } from "../model/OrderModel";
import { OrderResource, OrderItemResource } from "../Resources";

// Interner Typ, der das Mongoose-Dokument beschreibt.
interface IOrderExtended {
  _id: Types.ObjectId;
  buyerId: Types.ObjectId;
  items: { product: Types.ObjectId; quantity: number; price: number }[];
  orderDate: Date;
  status: "pending" | "completed" | "cancelled";
  paymentInfo: string;
  total: number;
}

function mapOrderToResource(o: IOrderExtended): OrderResource {
  return {
    id: o._id.toString(),
    buyerId: o.buyerId.toString(),
    items: o.items.map((item): OrderItemResource => ({
      productId: item.product.toString(),
      quantity: item.quantity,
      price: item.price,
    })),
    orderDate: o.orderDate.toISOString(),
    status: o.status,
    paymentInfo: o.paymentInfo,
    total: o.total,
  };
}

export async function createOrder(
  orderResources: OrderResource
): Promise<OrderResource> {
  try {
    const items = orderResources.items.map((item) => ({
      product: new Types.ObjectId(item.productId),
      quantity: item.quantity,
      price: item.price,
    }));

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const order = await Order.create({
      buyerId: new Types.ObjectId(orderResources.buyerId),
      items,
      orderDate: new Date(orderResources.orderDate),
      status: "pending",
      paymentInfo: orderResources.paymentInfo,
      total,
    });
    const o = (order.toObject() as unknown) as IOrderExtended;
    return mapOrderToResource(o);
  } catch (err) {
    throw new Error("Order creation failed: " + err);
  }
}

export async function getAllOrders(): Promise<OrderResource[]> {
  try {
    const orders = await Order.find({}).exec();
    const orderResources = orders.map((order) => {
      const o = (order.toObject() as unknown) as IOrderExtended;
      return mapOrderToResource(o);
    });
    return orderResources;
  } catch (err) {
    throw new Error("Error fetching orders: " + err);
  }
}

export async function getOrder(orderId: string): Promise<OrderResource> {
  if (!orderId) {
    throw new Error("Order id is missing, can't get it");
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Cannot find Order with id ${orderId}`);
    }
    const o = (order.toObject() as unknown) as IOrderExtended;
    return mapOrderToResource(o);
  } catch (err) {
    throw new Error("Order not found: " + err);
  }
}

export async function updateOrder(
  orderResources: OrderResource
): Promise<OrderResource> {
  if (!orderResources.id) {
    throw new Error("Order id is missing, can't update it");
  }
  try {
    // Bei einem Update werden typischerweise nicht die Items aktualisiert.
    const order = await Order.findOneAndUpdate(
      { _id: orderResources.id },
      {
        buyerId: orderResources.buyerId,
        orderDate: new Date(orderResources.orderDate),
        status: orderResources.status,
        paymentInfo: orderResources.paymentInfo,
        total: orderResources.total,
      },
      { new: true }
    );
    if (!order) {
      throw new Error(`Can't update the Order ${orderResources.id}`);
    }
    const o = (order.toObject() as unknown) as IOrderExtended;
    return mapOrderToResource(o);
  } catch (err) {
    throw new Error("Update Order failed: " + err);
  }
}

export async function deleteOrder(orderId: string): Promise<OrderResource> {
  if (!orderId) {
    throw new Error("Order id is missing, can't delete it");
  }
  const order = await Order.findByIdAndDelete(orderId);
  if (!order) {
    throw new Error(`Can't delete the order with id ${orderId}`);
  }
  const o = (order.toObject() as unknown) as IOrderExtended;
  return mapOrderToResource(o);
}
