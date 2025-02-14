import { Schema } from "mongoose";
import { IUser, User } from "./UserModel";

export interface ISeller extends IUser {
    shopName: string;
    rating?: number;
    contactInfo: string;
  }
  
  const SellerSchema = new Schema<ISeller>({
    shopName: { type: String, required: true },
    rating: { type: Number, default: 0 },
    contactInfo: { type: String, required: true }
  });
  
  export const Seller = User.discriminator<ISeller>("seller", SellerSchema);
  
  