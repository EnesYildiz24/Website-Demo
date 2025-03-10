// istanbul ignore file

import { logger } from "./logger";

import {
  AdminResource,
  SellerResource,
  BuyerResource,
  ProductResource,
} from "./Resources";
import { createAdmin, getAdminByEmail } from "./services/AdminService"; // Neu: findAdminByEmail
import { createSeller, getSellerByEmail } from "./services/SellerService"; // dito
import { createBuyer, getBuyerByEmail } from "./services/BuyerService"; // dito
import { createProduct, getProductByTitle } from "./services/ProductService";
import { Admin } from "./model/AdminModel";
import { Seller } from "./model/SellerModel";
import { Buyer } from "./model/BuyerModel";
import { Product } from "./model/ProductModel";

/**
 * Füllt die DB mit Beispielnutzern (Admin, Seller, Buyer) und ein paar Produkten.
 * So kannst du im Backend beim Start oder beim Deploy testweise Daten anlegen.
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

  // 2) Admin erstellen, wenn er nicht existiert
  let admin = await getAdminByEmail("admin@example.com");
  if (!admin) {
    admin = await createAdmin({
      username: "ChiefAdmin",
      email: "admin@example.com",
      password: "Admin123",
      role: "admin",
      permissions: ["ALL"],
    });
    logger.info(`Erstellter Admin: ${admin.username}, PW=Admin123`);
  } else {
    logger.info(
      `Admin mit Email ${admin.email} existiert bereits. Überspringe...`
    );
  }

  // 3) Seller
  let seller = await getSellerByEmail("seller@example.com");
  if (!seller) {
    seller = await createSeller({
      username: "SuperSeller",
      email: "seller@example.com",
      password: "SellerPass",
      role: "seller",
      shopName: "BestGamesShop",
      contactInfo: "Tel: 12345 / Email: contact@sellershop.de",
    });
    logger.info(`Erstellter Seller: ${seller.username}, PW=SellerPass`);
  } else {
    logger.info(
      `Seller mit Email ${seller.email} existiert bereits. Überspringe...`
    );
  }

  // 4) Buyer
  let buyer = await getBuyerByEmail("buyer@example.com");
  if (!buyer) {
    buyer = await createBuyer({
      username: "FirstBuyer",
      email: "buyer@example.com",
      password: "BuyerPass",
      role: "buyer",
    });
    logger.info(`Erstellter Buyer: ${buyer.username}, PW=BuyerPass`);
  } else {
    logger.info(
      `Buyer mit Email ${buyer.email} existiert bereits. Überspringe...`
    );
  }

  // 5) Produkte anlegen
  const products: ProductResource[] = [];

  // Beispiel: Du könntest hier auch erst checken, ob ein Produkt mit Titel X existiert.
  // Wir gehen davon aus, dass wir immer neue Produkte anlegen oder zumindest keine Unique-Constraint auf 'titel' existiert.
// prefillDB.ts
  const p1 = await createProduct({
    titel: "MetalGearSolid",
    description: "gay army game",
    price: 49.99,
    images: ["http://localhost:3000/static/images/Images.jpeg"],
    category: "RPG",
  });

  const p2 = await createProduct({
    titel: "God of war 2",
    description: "Ein Mann der sein papi tötet",
    price: 29.99,
    images: ["http://localhost:3000/static/images/godOfWar.jpeg"],
    category: "arcade",
  });

  const p3 = await createProduct({
    titel: "Crysis",
    description: "Alien game",
    price: 59.99,
    images: ["http://localhost:3000/static/images/Unknown.jpeg"],
    category: "Shooter",
  });

  const p4 = await createProduct({
    titel: "DOOD",
    description: "D D D D DOOM",
    price: 19.99,
    images: ["http://localhost:3000/static/images/bild.jpeg"],
    category: "Shooter",
  });
  products.push(p1, p2, p3, p4);

  logger.info(`Zwei Beispielprodukte angelegt: ${p1.titel}, ${p2.titel}`);

  return {
    admin,
    seller,
    buyer,
    products,
  };
}
