import { Schema, model, Model } from "mongoose";

export interface IOrder {
  buyerId: Schema.Types.ObjectId;  
  productId: Schema.Types.ObjectId; 
  orderDate: Date;
  status: "pending" | "completed" | "cancelled";
  paymentInfo: string;
}

export type OrderModel = Model<IOrder>;

const orderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending"
    },
    paymentInfo: { type: String, required: true }
  },
  { timestamps: false }
);

export const Order = model<IOrder, OrderModel>("Order", orderSchema);
