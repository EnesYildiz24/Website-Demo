import { Schema, model, Types, Model } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: "admin" | "seller" | "buyer";
}

export type userModel = Model<IUser>;

const myUserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "seller", "buyer"], default: "buyer" },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser, userModel>("User", myUserSchema);
