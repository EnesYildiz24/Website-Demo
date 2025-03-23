import { Schema, model, Types, Model } from "mongoose";
import { IUser } from "./UserModel"; // oder wo immer dein User-Interface liegt

export interface IProduct {
  titel: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  seller: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const myProductSchema = new Schema<IProduct>(
  {
    titel: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct>("Product", myProductSchema);
