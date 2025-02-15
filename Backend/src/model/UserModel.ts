import { Schema, model, Types, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: "admin" | "seller" | "buyer";
}

export type userModel = Model<IUser>;

export interface IUserMethods {
  isCorrectPassword(candidatePassword: string): Promise<boolean>;
}

const myUserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "seller", "buyer"],
      default: "buyer",
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'kind'
  }
);

myUserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});

myUserSchema.pre("updateOne", async function (next) {
  const update = this.getUpdate();
  if (update && "password" in update) {
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
  }
  next();
});

myUserSchema.method(
  "isCorrectPassword",
  async function (candiatePassword: string): Promise<boolean> {
    if (!this.password || this.password.slice(0, 4) !== "$2a$") {
      throw new Error("password not hashed");
    }
    return bcrypt.compare(candiatePassword, this.password);
  }
);

export const User = model<IUser, userModel>("User", myUserSchema);
