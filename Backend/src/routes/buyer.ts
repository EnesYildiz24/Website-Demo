import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import { optionalAuthentication, requiresAuthentication } from "./authenticator";
import { BuyerResource } from "../Resources";
import {
getAllBuyers,
getBuyer,
createBuyer,
updateBuyer,
deleteBuyer,
} from "../services/BuyerService";

const buyerRouter = Router();

buyerRouter.get(
"/",
optionalAuthentication,
async (req: Request, res: Response) => {
    try {
        const buyers = await getAllBuyers();
        res.json(buyers);
    } catch (error) {
        logger.error("Fehler beim Abrufen der Käufer:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Käufer", error });
    }
}
);

buyerRouter.get(
"/:id",
optionalAuthentication,
param("id").isMongoId().withMessage("Ungültige Käufer-ID"),
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const buyer = await getBuyer(req.params.id);
        if (!buyer) {
            res.status(404).json({
                message: `Kein Käufer mit der ID ${req.params.id} gefunden`,
            });
            return;
        }
        res.json(buyer);
    } catch (error) {
        logger.error("Fehler beim Abrufen eines Käufers:", error);
        res.status(500).json({ message: "Fehler beim Abrufen eines Käufers", error });
        next(error);
    }
}
);

buyerRouter.post(
"/",
requiresAuthentication,
[
    body("username").notEmpty().withMessage("Der Benutzername darf nicht leer sein"),
    body("email").isEmail().withMessage("Ungültige E-Mail-Adresse"),
    body("password").isLength({ min: 6 }).withMessage("Das Passwort muss mindestens 6 Zeichen lang sein"),
    body("role").equals("buyer").withMessage("Rolle muss buyer sein"),
],
async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const newBuyer = await createBuyer(req.body);
        res.status(201).json(newBuyer);
    } catch (error) {
        logger.error("Fehler beim Erstellen eines Käufers:", error);
        res.status(500).json({ message: "Fehler beim Erstellen eines Käufers", error });
    }
}
);

buyerRouter.put(
"/:id",
requiresAuthentication,
[
    param("id").isMongoId().withMessage("Ungültige Käufer-ID"),
    body("username").optional().notEmpty().withMessage("Der Benutzername darf nicht leer sein"),
    body("email").optional().isEmail().withMessage("Ungültige E-Mail-Adresse"),
    body("password").optional().isLength({ min: 6 }).withMessage("Das Passwort muss mindestens 6 Zeichen lang sein"),
    body("role").optional().equals("buyer").withMessage("Rolle muss buyer sein"),
],
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const buyerResource: BuyerResource = {
            id: req.params.id,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: "buyer",
        };
        const updatedBuyer = await updateBuyer(buyerResource);
        if (!updatedBuyer) {
            res.status(404).json({
                message: `Kein Käufer mit der ID ${req.params.id} gefunden, Update nicht möglich`,
            });
            return;
        }
        res.json(updatedBuyer);
    } catch (error) {
        logger.error("Fehler beim Aktualisieren eines Käufers:", error);
        next(error);
    }
}
);

buyerRouter.delete(
"/:id",
requiresAuthentication,
async (req: Request, res: Response) => {
    try {
        const deletedBuyer = await deleteBuyer(req.params.id);
        if (!deletedBuyer) {
            res.status(404).json({ message: "Käufer nicht gefunden oder bereits gelöscht" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        logger.error("Fehler beim Löschen eines Käufers:", error);
        res.status(500).json({ message: "Fehler beim Löschen eines Käufers", error });
    }
}
);

export { buyerRouter };