import { Schema, model, Model } from "mongoose";

export interface ICategory {
  name: string;
  description: string;
}

export type CategoryModel = Model<ICategory>;

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

export const Category = model<ICategory, CategoryModel>("Category", categorySchema);
