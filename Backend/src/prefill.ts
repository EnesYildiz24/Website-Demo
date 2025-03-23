// istanbul ignore file

import { logger } from "./logger";

import {
  AdminResource,
  SellerResource,
  BuyerResource,
  ProductResource,
  CategoryResource,
} from "./Resources";
import { createAdmin, getAdminByEmail } from "./services/AdminService";
import { createSeller, getSellerByEmail } from "./services/SellerService";
import { createBuyer, getBuyerByEmail } from "./services/BuyerService";
import { createProduct, getProductByTitle } from "./services/ProductService";
import { createCategory, getCategoryByName } from "./services/CategoryService";

import { Admin } from "./model/AdminModel";
import { Seller } from "./model/SellerModel";
import { Buyer } from "./model/BuyerModel";
import { Product } from "./model/ProductModel";
// Angenommen, du hast auch ein Category Model, das in createCategory verwendet wird.

export async function prefillDB(): Promise<{
  admin: AdminResource;
  seller: SellerResource;
  buyer: BuyerResource;
  products: ProductResource[];
  categories: CategoryResource[];
}> {
  // 1) Indexe synchronisieren (optional)
  await Admin.syncIndexes();
  await Seller.syncIndexes();
  await Buyer.syncIndexes();
  await Product.syncIndexes();
  // Falls dein Category Model Indexe benötigt, auch:
  // await Category.syncIndexes();

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
    logger.info(`Admin mit Email ${admin.email} existiert bereits. Überspringe...`);
  }

  // 3) Seller erstellen, wenn nicht vorhanden
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
    logger.info(`Seller mit Email ${seller.email} existiert bereits. Überspringe...`);
  }

  // 4) Buyer erstellen, wenn nicht vorhanden
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
    logger.info(`Buyer mit Email ${buyer.email} existiert bereits. Überspringe...`);
  }

  // 5) Produkte anlegen – selektives Pre-Filling anhand des Titels
  const products: ProductResource[] = [];

  let p1 = await getProductByTitle("MetalGearSolid");
  if (!p1) {
    p1 = await createProduct({
      titel: "MetalGearSolid",
      description: "gay army game",
      price: 49.99,
      images: ["http://localhost:3000/static/images/Images.jpeg"],
      category: "Shooter",
    },seller.id!);
    logger.info(`Produkt angelegt: ${p1.titel}`);
  } else {
    logger.info(`Produkt ${p1.titel} existiert bereits. Überspringe...`);
  }
  products.push(p1);

  let p2 = await getProductByTitle("God of war 2");
  if (!p2) {
    p2 = await createProduct({
      titel: "God of war 2",
      description: "Ein Mann der sein papi tötet",
      price: 29.99,
      images: ["http://localhost:3000/static/images/godOfWar.jpeg"],
      category: "Arcade",
      sellerName: seller.username,
    } ,seller.id!);
    
    logger.info(`Produkt angelegt: ${p2.titel}`);
  } else {
    logger.info(`Produkt ${p2.titel} existiert bereits. Überspringe...`);
  }
  products.push(p2);

  let p3 = await getProductByTitle("Crysis");
  if (!p3) {
    p3 = await createProduct({
      titel: "Crysis",
      description: "Alien game",
      price: 59.99,
      images: ["http://localhost:3000/static/images/Unknown.jpeg"],
      category: "Shooter",
    },seller.id!);
    logger.info(`Produkt angelegt: ${p3.titel}`);
  } else {
    logger.info(`Produkt ${p3.titel} existiert bereits. Überspringe...`);
  }
  products.push(p3);

  let p4 = await getProductByTitle("DOOD");
  if (!p4) {
    p4 = await createProduct({
      titel: "DOOD",
      description: "D D D D DOOM",
      price: 19.99,
      images: ["http://localhost:3000/static/images/bild.jpeg"],
      category: "Shooter",
    },seller.id!);
    logger.info(`Produkt angelegt: ${p4.titel}`);
  } else {
    logger.info(`Produkt ${p4.titel} existiert bereits. Überspringe...`);
  }
  products.push(p4);

  // 6) Kategorien anlegen – nur, wenn sie noch nicht existieren
  const categories: CategoryResource[] = [];
  const categoryList = [
    { name: "Horror", description: "Schockierende und spannende Horrorgeschichten." },
    { name: "Action", description: "Schnelle, adrenalingeladene Spiele." },
    { name: "Story", description: "Spiele mit fesselnden Handlungen und Erzählungen." },
    { name: "Shooter", description: "Spiele, in denen Schießen und Zielgenauigkeit im Fokus stehen." },
    { name: "Arcade", description: "Klassische Arcade-Spiele mit einfachem, süchtig machendem Gameplay." },
  ];

  for (const cat of categoryList) {
    const existingCat = await getCategoryByName(cat.name);
    if (!existingCat) {
      const newCat = await createCategory(cat);
      categories.push(newCat);
      logger.info(`Kategorie angelegt: ${newCat.name}`);
    } else {
      categories.push(existingCat);
      logger.info(`Kategorie ${existingCat.name} existiert bereits. Überspringe...`);
    }
  }

  return {
    admin,
    seller,
    buyer,
    products,
    categories,
  };
}
