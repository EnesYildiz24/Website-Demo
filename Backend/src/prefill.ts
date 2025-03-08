// istanbul ignore file

import { logger } from "./logger";

import {
  AdminResource,
  SellerResource,
  BuyerResource,
  ProductResource,
} from "./Resources";
import { createAdmin } from "./services/AdminService";
import { createSeller } from "./services/SellerService";
import { createBuyer } from "./services/BuyerService";
import { createProduct } from "./services/ProductService";
import { Admin } from "./model/AdminModel";
import { Seller } from "./model/SellerModel";
import { Buyer } from "./model/BuyerModel";
import { Product } from "./model/ProductModel";

/**
 * Füllt die DB mit Beispielnutzern (Admin, Seller, Buyer) und ein paar Produkten.
 * 
 * So kannst du im Backend beim Start oder beim Deploy
 * testweise Daten anlegen, die du im Frontend abrufen kannst.
 */
export async function prefillDB(): Promise<{
  admin: AdminResource;
  seller: SellerResource;
  buyer: BuyerResource;
  products: ProductResource[];
}> {
  // 1) Indexe (optional) synchronisieren
  await Admin.syncIndexes();
  await Seller.syncIndexes();
  await Buyer.syncIndexes();
  await Product.syncIndexes();

  // 2) Erstelle einen Admin
  const admin = await createAdmin({
    username: "ChiefAdmin",
    email: "admin@example.com",
    password: "Admin123", // Klartext oder gehashed, je nach Service
    role: "admin",
    permissions: ["ALL"],
  });
  logger.info(`Erstellter Admin: ${admin.username}, PW=Admin123`);

  // 3) Erstelle einen Seller (z.B. Shop-Betreiber)
  const seller = await createSeller({
    username: "SuperSeller",
    email: "seller@example.com",
    password: "SellerPass",
    role: "seller",
    shopName: "BestGamesShop",
    contactInfo: "Tel: 12345 / Email: contact@sellershop.de",
  });
  logger.info(`Erstellter Seller: ${seller.username}, PW=SellerPass`);

  // 4) Erstelle einen Buyer (Kundenkonto)
  const buyer = await createBuyer({
    username: "FirstBuyer",
    email: "buyer@example.com",
    password: "BuyerPass",
    role: "buyer",
  });
  logger.info(`Erstellter Buyer: ${buyer.username}, PW=BuyerPass`);

  // 5) Erstelle ein paar Produkte
  const products: ProductResource[] = [];

  const p1 = await createProduct({
    titel: "Endless RPG",
    description: "Ein spannendes Rollenspiel mit endlosem Level-System",
    price: 49.99,
    images: ["http://example.com/img/rpg1.jpg"],
    category: "RPG",
  });

  const p2 = await createProduct({
    titel: "Space Shooter Deluxe",
    description: "Ein Arcade-Weltraumshooter mit HD-Grafiken",
    price: 29.99,
    images: ["http://example.com/img/spaceshooter1.jpg"],
    category: "Shooter",
  });

  products.push(p1, p2);

  logger.info(`Zwei Beispielprodukte angelegt: ${p1.titel}, ${p2.titel}`);

  // 6) Rückgabe, wenn du sie weiterverwenden willst
  return {
    admin,
    seller,
    buyer,
    products,
  };
}
