import { SellerResource } from "../Resources";
import { logger } from "../logger";
import { Seller } from "../model/SellerModel";

export async function createSeller(
  sellerResource: SellerResource
): Promise<SellerResource> {
  try {
    const existingSeller = await Seller.findOne({
      email: sellerResource.email,
    });
    if (existingSeller) {
      throw new Error("Email must be unique");
    }
    const seller = await Seller.create({
      username: sellerResource.username,
      email: sellerResource.email,
      password: sellerResource.password,
      role: "seller",
      shopName: sellerResource.shopName,
      contactInfo: sellerResource.contactInfo,
      rating: sellerResource.rating
    });
    return {
      id: seller._id.toString(),
      username: seller.username,
      email: seller.email,
      role: "seller",
      shopName: seller.shopName,
      contactInfo: seller.contactInfo,
    };
  } catch (err) {
    logger.error("Verkäufer konnte nicht erstellt werden: " + err);
    throw new Error("Verkäufer creation failed: " + err);
  }
}

export async function getAllSeller(): Promise<SellerResource[]> {
  try {
    const sellers = await Seller.find({}).exec();
    const sellerResources = sellers.map((seller) => ({
      id: seller._id.toString(),
      username: seller.username,
      email: seller.email,
      role: "seller" as "seller",
      shopName: seller.shopName,
      contactInfo: seller.contactInfo,
      rating: seller.rating
    }));
    return sellerResources;
  } catch (err) {
    throw new Error("Error fetching Verkäufer: " + err);
  }
}

export async function getSeller(sellerId: string): Promise<SellerResource> {
  const seller = await Seller.findById(sellerId);
  if(!seller){
    throw new Error(`No seller with id ${sellerId} found`);
  }
  return{
    id: seller._id.toString(),
    username: seller.username,
    email: seller.email,
    role: "seller",
    shopName: seller.shopName,
    contactInfo: seller.contactInfo,
    rating: seller.rating
  }
}

export async function updateSeller(
  sellerResource: SellerResource
): Promise<SellerResource> {
  if (!sellerResource.id) {
    throw new Error("Verkäufer id is missing, can't update it");
  }
  try {
    const updateFields = {
        username: sellerResource.username,
        email: sellerResource.email,
        ...(sellerResource.password && { password: sellerResource.password }),
        ...(sellerResource.shopName && { shopName: sellerResource.shopName }),
        ...(sellerResource.contactInfo && { contactInfo: sellerResource.contactInfo }),
        ...(sellerResource.rating !== undefined && { rating: sellerResource.rating }),
      };
  
      const seller = await Seller.findOneAndUpdate(
        { _id: sellerResource.id },
        updateFields,
        { new: true }
      );
    if (!seller) {
      throw new Error(`Cannot update Seller with id ${sellerResource.id}`);
    }
    return {
      id: seller._id.toString(),
      username: seller.username,
      email: seller.email,
      role: "seller",
      shopName: seller.shopName,
      contactInfo: seller.contactInfo,
      rating: seller.rating,
    };
  } catch (err) {
    logger.error("Update Verkäufer fehlgeschlagen: " + err);
    throw new Error("Update Verkäufer failed: " + err);
  }
}

export async function deleteSeller(sellerId: string): Promise<SellerResource> {
  if (!sellerId) {
    throw new Error("Verkäufer id is missing, can't delete it");
  }
  try {
    const seller = await Seller.findByIdAndDelete(sellerId);
    if (!seller) {
      throw new Error(`Cannot delete Verkäufer with id ${sellerId}`);
    }
    return {
      id: seller._id.toString(),
      username: seller.username,
      email: seller.email,
      role: "seller",
      shopName: seller.shopName,
      contactInfo: seller.contactInfo,
      rating:seller.rating
    };
  } catch (err) {
    logger.error("Delete Verkäufer fehlgeschlagen: " + err);
    throw new Error("Delete Verkäufer failed: " + err);
  }
}


export async function getSellerByEmail(email: string): Promise<SellerResource | null> {
  const seller = await Seller.findOne({ email }).exec();
  if (!seller) return null;

  return {
    id: seller._id.toString(),
    username: seller.username,
    email: seller.email,
    role: "seller",
    shopName: seller.shopName,
    contactInfo: seller.contactInfo,
    rating: seller.rating
  };
}