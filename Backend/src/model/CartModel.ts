import { Types, Schema, model, Document } from "mongoose";

interface CartItem {
  product: Types.ObjectId;
  quantity: number;
}
interface PopulatedCartItem {
  product: {
    _id: string;
    price: number;
    titel: string;
  };
  quantity: number;
}


export interface ICart extends Document {
  user: Types.ObjectId; 
  items: CartItem[];
}

const cartItemSchema = new Schema<CartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
});

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default model<ICart>("Cart", cartSchema);
