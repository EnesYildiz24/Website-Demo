import { Schema } from "mongoose";
import { IUser, User } from "./UserModel";

export interface IBuyer extends IUser {
    shippingAddress?: string;
    paymentMethods?: string;
  }
  
  const BuyerSchema = new Schema<IBuyer>({
    shippingAddress: { type: String },
    paymentMethods: { type: String }
  });
  
  export const Buyer = User.discriminator<IBuyer>("buyer", BuyerSchema);