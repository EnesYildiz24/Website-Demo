import { logger } from "../logger";
import { Category } from "../model/CategoryModel";
import { CategoryResource } from "../Resources";

export async function createCategory(
  CategoryResource: CategoryResource
): Promise<CategoryResource> {
  const existCategory = await Category.findOne({ name: CategoryResource.name });
  if (existCategory) {
    throw new Error("Name must be unique");
  }
  try {
    const category = await Category.create({
      name: CategoryResource.name,
      description: CategoryResource.description,
    });
    return {
      id: category?._id.toString(),
      name: category.name,
      description: category.description,
    };
  } catch (err) {
    logger.error("Category konnte nicht erstellt werden: " + err);
    throw new Error("Category created failed: " + err);
  }
}

export async function getAlleCategory(): Promise<CategoryResource[]> {
  try {
    const alleCategory = await Category.find({}).exec();
    const alleCategoryRes = alleCategory.map((category) => ({
      id: category?.id,
      name: category.name,
      description: category.description,
    }));
    return alleCategoryRes;
  } catch (err) {
    throw new Error("Category not Found: " + err);
  }
}

export async function getCategory(
  categoryId: string
): Promise<CategoryResource> {
  if (!categoryId) {
    throw new Error("Category id is missing, can't get it");
  }
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error(`Cannot find Category with id ${categoryId}`);
    }
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
    };
  } catch (err) {
    throw new Error("Category not Found: " + err);
  }
}
export async function updateCategory(
  CategoryResource: CategoryResource
): Promise<CategoryResource> {
  if (!CategoryResource.id) {
    throw new Error("Category id is missing, cant update it");
  }
  try {
    const category = await Category.findOneAndUpdate(
      { _id: CategoryResource.id },
      {
        name: CategoryResource.name,
        description: CategoryResource.description,
      },
      { new: true }
    );
    if (!category) {
      throw new Error(`cant update the Category ${CategoryResource.id}`);
    }
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
    };
  } catch (err) {
    throw new Error("update Category fehlgeschlagen: " + err);
  }
}

export async function deleteCategory(
  categoryId: string
): Promise<CategoryResource> {
  if (!categoryId) {
    throw new Error("Category id is missing, can't delete it");
  }

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new Error(`Can't delete the category with id ${categoryId}`);
  }

  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
  };
}
