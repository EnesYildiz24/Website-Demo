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
      role: "b",
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
      role: "b" as "b",
    }));
    return buyerResources; 
  } catch (err) {
    throw new Error("Error fetching customer: " + err);
  }
}