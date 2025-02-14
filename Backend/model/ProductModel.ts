import { Schema, model, Types, Model } from "mongoose";

export interface IProduct {
  titel: string;
  description: string;
  price: number;
  images: String[];
  createdAt?: Date;
  updatedAt?: Date; 
  category: String
}

export type productModel = Model<IProduct>;

const myProductSchema = new Schema<IProduct>(
  {
    titel: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true ,  default: 0 },
    images: { type: [String], required: true },
    category: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct, productModel>("Product", myProductSchema);
