// src/model/OrderModel.ts
import { Schema, model, Document, Types } from "mongoose";

export interface OrderItem {
  product: Types.ObjectId; 
  quantity: number;
  price: number; 
}

export interface IOrder extends Document {
  buyerId: Types.ObjectId;
  items: OrderItem[];
  orderDate: Date;
  status: "pending" | "completed" | "cancelled";
  paymentInfo: string;
  total: number;
}

const orderItemSchema = new Schema<OrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    paymentInfo: { type: String, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: false }
);

export const Order = model<IOrder>("Order", orderSchema);
