import { Router, Request, Response, NextFunction } from "express";
import { SellerResource } from "../Resources";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import { optionalAuthentication, requiresAuthentication } from "./authenticator";
import {
    getAllSeller,
    getSeller,
    createSeller,
    updateSeller,
    deleteSeller,
} from "../services/SellerService";

const sellerRouter = Router();

sellerRouter.get(
"/",
optionalAuthentication,
async (req: Request, res: Response) => {
    try {
        const sellers = await getAllSeller();
        res.json(sellers);
    } catch (error) {
        logger.error("Fehler beim Abrufen der Verkäufer:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Verkäufer", error });
    }
}
);

sellerRouter.get(
"/:id",
optionalAuthentication,
param("id").isMongoId().withMessage("Ungültige Verkäufer-ID"),
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const seller = await getSeller(req.params.id);
        if (!seller) {
            res.status(404).json({
                message: `Kein Verkäufer mit der ID ${req.params.id} gefunden`,
            });
            return;
        }
        res.json(seller);
    } catch (error) {
        logger.error("Fehler beim Abrufen eines Verkäufers:", error);
        res.status(500).json({ message: "Fehler beim Abrufen eines Verkäufers", error });
        next(error);
    }
}
);

sellerRouter.post(
"/",
requiresAuthentication,
[
    body("username").notEmpty().withMessage("Der Benutzername darf nicht leer sein"),
    body("email").isEmail().withMessage("Ungültige E-Mail-Adresse"),
    body("password").isLength({ min: 6 }).withMessage("Das Passwort muss mindestens 6 Zeichen lang sein"),
    body("role").equals("seller").withMessage("Rolle muss seller sein"),
    body("shopName").notEmpty().withMessage("Der Shopname darf nicht leer sein"),
    body("contactInfo").notEmpty().withMessage("Die Kontaktinformationen dürfen nicht leer sein"),
],
async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const newSeller = await createSeller(req.body);
        res.status(201).json(newSeller);
    } catch (error) {
        logger.error("Fehler beim Erstellen eines Verkäufers:", error);
        res.status(500).json({ message: "Fehler beim Erstellen eines Verkäufers", error });
    }
}
);

sellerRouter.put(
"/:id",
requiresAuthentication,
[
    param("id").isMongoId().withMessage("Ungültige Verkäufer-ID"),
    body("username").optional().notEmpty().withMessage("Der Benutzername darf nicht leer sein"),
    body("email").optional().isEmail().withMessage("Ungültige E-Mail-Adresse"),
    body("password").optional().isLength({ min: 6 }).withMessage("Das Passwort muss mindestens 6 Zeichen lang sein"),
    body("role").optional().equals("seller").withMessage("Rolle muss seller sein"),
    body("shopName").optional().notEmpty().withMessage("Der Shopname darf nicht leer sein"),
    body("contactInfo").optional().notEmpty().withMessage("Die Kontaktinformationen dürfen nicht leer sein"),
],
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const sellerResource: SellerResource = {
            id: req.params.id,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: "seller",
            shopName: req.body.shopName,
            contactInfo: req.body.contactInfo,
        };
        const updatedSeller = await updateSeller(sellerResource);
        if (!updatedSeller) {
            res.status(404).json({
                message: `Kein Verkäufer mit der ID ${req.params.id} gefunden, Update nicht möglich`,
            });
            return;
        }
        res.json(updatedSeller);
    } catch (error) {
        logger.error("Fehler beim Aktualisieren eines Verkäufers:", error);
        next(error);
    }
}
);

sellerRouter.delete(
"/:id",
requiresAuthentication,
async (req: Request, res: Response) => {
    try {
        const deletedSeller = await deleteSeller(req.params.id);
        if (!deletedSeller) {
            res.status(404).json({ message: "Verkäufer nicht gefunden oder bereits gelöscht" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        logger.error("Fehler beim Löschen eines Verkäufers:", error);
        res.status(500).json({ message: "Fehler beim Löschen eines Verkäufers", error });
    }
}
);

export { sellerRouter };