import { Router, Request, Response, RequestHandler } from "express";
import { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct } from "../services/ProductService";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import { optionalAuthentication, requiresAuthentication } from "./authenticator";

const productRouter = Router();

productRouter.get("/", async (req: Request, res: Response) => {
  try {
    const products = await getAllProduct();
    res.json(products);
  } catch (error) {
    logger.error("Fehler beim Abrufen der Produkte:", error);
    res.status(500).json({ message: "Fehler beim Abrufen der Produkte", error });
  }
});

productRouter.get(
  "/:id",
  optionalAuthentication as RequestHandler,
  param("id").isMongoId().withMessage("Ungültige Produkt-ID"),
  async (req: Request, res: Response) => {
    try {
      const product = await getProduct(req.params.id);
      if (!product) {
        res.status(404).json({ message: `Kein Produkt mit der ID ${req.params.id} gefunden` });
        return;
      }
      res.json(product);
    } catch (error) {
      logger.error("Fehler beim Abrufen eines Produkts:", error);
      res.status(500).json({ message: "Fehler beim Abrufen eines Produkts", error });
    }
  }
);

productRouter.post(
  "/",
  requiresAuthentication as RequestHandler,
  [
    body("titel").notEmpty().withMessage("Der Titel darf nicht leer sein"),
    body("description").notEmpty().withMessage("Die Beschreibung darf nicht leer sein"),
    body("price").isFloat({ gt: 0 }).withMessage("Der Preis muss größer als 0 sein"),
    body("images").isArray().withMessage("Die Bilder müssen ein Array sein"),
    body("category").notEmpty().withMessage("Die Kategorie darf nicht leer sein"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const newProduct = await createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      logger.error("Fehler beim Erstellen eines Produkts:", error);
      res.status(500).json({ message: "Fehler beim Erstellen eines Produkts", error });
    }
  }
);

productRouter.put(
  "/:id",
  requiresAuthentication as RequestHandler,
  [
    param("id").isMongoId().withMessage("Ungültige Produkt-ID"),
    body("titel").optional().notEmpty().withMessage("Der Titel darf nicht leer sein"),
    body("description").optional().notEmpty().withMessage("Die Beschreibung darf nicht leer sein"),
    body("price").optional().isFloat({ gt: 0 }).withMessage("Der Preis muss größer als 0 sein"),
    body("images").optional().isArray().withMessage("Die Bilder müssen ein Array sein"),
    body("category").optional().notEmpty().withMessage("Die Kategorie darf nicht leer sein"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const productResource = { id: req.params.id, ...req.body };
      const updatedProduct = await updateProduct(productResource);
      if (!updatedProduct) {
        res.status(404).json({ message: `Kein Produkt mit der ID ${req.params.id} gefunden, Update nicht möglich` });
        return;
      }
      res.json(updatedProduct);
    } catch (error) {
      logger.error("Fehler beim Aktualisieren eines Produkts:", error);
      res.status(500).json({ message: "Fehler beim Aktualisieren eines Produkts", error });
    }
  }
);

productRouter.delete(
  "/:id",
  requiresAuthentication as RequestHandler,
  param("id").isMongoId().withMessage("Ungültige Produkt-ID"),
  async (req: Request, res: Response) => {
    try {
      const deletedProduct = await deleteProduct(req.params.id);
      if (!deletedProduct) {
        res.status(404).json({ message: "Produkt nicht gefunden oder bereits gelöscht" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      logger.error("Fehler beim Löschen eines Produkts:", error);
      res.status(500).json({ message: "Fehler beim Löschen eines Produkts", error });
    }
  }
);

export { productRouter };