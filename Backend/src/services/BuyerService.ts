import { promises } from "dns";
import { BuyerResource } from "../Resources";
import { Buyer } from "../model/BuyerModel";
import { logger } from "../logger";

export async function createBuyer(
  buyerResource: BuyerResource
): Promise<BuyerResource> {
  try {
    const buyer = await Buyer.create({
      username: buyerResource.username,
      email: buyerResource.email,
      password: buyerResource.password,
      role: "buyer",
    });
    return {
      id: buyer._id.toString(),
      username: buyer.username,
      email: buyer.email,
      role: "buyer",
    };
  } catch (err) {
    logger.error("Käufer konnte nicht erstellt werden: " + err);
    throw new Error("Käufer creation failed: " + err)
  }
}

export async function getAllBuyers(): Promise<BuyerResource[]> {
  try {
    const buysers = await Buyer.find({}).exec();
    const buyerResources = buysers.map((buyer) => ({
      id: buyer._id.toString(),
      username: buyer.username,
      email: buyer.email,
      role: "buyer" as "buyer",
    }));
    return buyerResources; 
  } catch (err) {
    throw new Error("Error fetching customer: " + err);
  }
}

export async function updateBuyer(
  buyerResource: BuyerResource
): Promise<BuyerResource> {
  if (!buyerResource.id) {
    throw new Error("Customer id is missing, can't update it");
  }
  try {
    const buyer = await Buyer.findOneAndUpdate(
      { _id: buyerResource.id },
      {
        username: buyerResource.username,
        email: buyerResource.email,
        ...(buyerResource.password && { password: buyerResource.password }),
      },
      { new: true }
    );
    if (!buyer) {
      throw new Error(`Cannot update Customer with id ${buyerResource.id}`);
    }
    return {
      id: buyer._id.toString(),
      username: buyer.username,
      email: buyer.email,
      role: "buyer",
    };
  } catch (err) {
    logger.error("Update Customer fehlgeschlagen: " + err);
    throw new Error("Update Customer failed: " + err);
  }
}

export async function deleteBuyer(buyerId: string): Promise<BuyerResource> {
  if (!buyerId) {
    throw new Error("Customer id is missing, can't delete it");
  }
  try {
    const buyer = await Buyer.findByIdAndDelete(buyerId);
    if (!buyer) {
      throw new Error(`Cannot delete Customer with id ${buyerId}`);
    }
    return {
      id: buyer._id.toString(),
      username: buyer.username,
      email: buyer.email,
      role: "buyer",
    };
  } catch (err) {
    logger.error("Delete Customer fehlgeschlagen: " + err);
    throw new Error("Delete Customer failed: " + err);
  }
}
