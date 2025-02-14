import { Schema } from "mongoose";
import { IUser, User } from "./UserModel";

export interface IAdmin extends IUser {
    permissions: string[];
  }
  
  const AdminSchema = new Schema<IAdmin>({
    permissions: { type: [String], default: [] }
  });
  
  export const Admin = User.discriminator<IAdmin>("admin", AdminSchema);
  