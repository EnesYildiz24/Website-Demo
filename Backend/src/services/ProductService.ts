import { ProductResource } from "../Resources";
import { logger } from "../logger";
import { Product } from "../model/ProductModel";

export async function createProduct(
  productResource: ProductResource
): Promise<ProductResource> {
  try {
    const product = await Product.create({
      titel: productResource.titel,
      description: productResource.description,
      price: productResource.price,
      images: productResource.images,
      category: productResource.category,
    });
    return {
      id: product._id.toString(),
      titel: product.titel,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    };
  } catch (err) {
    logger.error("Product creation failed: " + err);
    throw new Error("Product creation failed: " + err);
  }
}

export async function getAllProduct(): Promise<ProductResource[]> {
  try {
    const products = await Product.find({}).exec();
    return products.map((product) => ({
      id: product._id.toString(),
      titel: product.titel,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    }));
  } catch (err) {
    logger.error("Error fetching Products: " + err);
    throw new Error("Error fetching Products: " + err);
  }
}
export async function updateProduct(
  productResource: ProductResource
): Promise<ProductResource> {
  if (!productResource.id) {
    throw new Error("Product id is missing, can't update it");
  }
  try {
    const product = await Product.findOneAndUpdate(
      { _id: productResource.id },
      {
        titel: productResource.titel,
        description: productResource.description,
        price: productResource.price,
        images: productResource.images,
        category: productResource.category,
      },
      { new: true } 
    );

    if (!product) {
      throw new Error(`Cannot update Product with id: ${productResource.id}`);
    }

    return {
      id: product._id.toString(),
      titel: product.titel,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    };
  } catch (err) {
    logger.error("Update Product failed: " + err);
    throw new Error("Update Product failed: " + err);
  }
}

export async function deleteProduct(productId: string): Promise<ProductResource> {
  if (!productId) {
    throw new Error("Product id is missing, can't delete it");
  }
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new Error(`Cannot delete product with id: ${productId}`);
    }
    return {
      id: product._id.toString(),
      titel: product.titel,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    };
  } catch (err) {
    logger.error("Delete Product failed: " + err);
    throw new Error("Delete Product failed: " + err);
  }
}
