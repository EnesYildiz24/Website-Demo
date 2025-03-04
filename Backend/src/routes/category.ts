import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import { optionalAuthentication, requiresAuthentication } from "./authenticator";
import { CategoryResource } from "../Resources";
import {

createCategory,
getAlleCategory,
updateCategory,
deleteCategory,
getCategory,
} from "../services/CategoryService";

const categoryRouter = Router();

categoryRouter.get(
"/",
optionalAuthentication,
async (req: Request, res: Response) => {
    try {
        const categories = await getAlleCategory();
        res.json(categories);
    } catch (error) {
        logger.error("Fehler beim Abrufen der Kategorien:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Kategorien", error });
    }
}
);

categoryRouter.get(
"/:id",
optionalAuthentication,
param("id").isMongoId().withMessage("Ungültige Kategorie-ID"),
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await getCategory(req.params.id);
        if (!category) {
            res.status(404).json({
                message: `Keine Kategorie mit der ID ${req.params.id} gefunden`,
            });
            return;
        }
        res.json(category);
    } catch (error) {
        logger.error("Fehler beim Abrufen einer Kategorie:", error);
        res.status(500).json({ message: "Fehler beim Abrufen einer Kategorie", error });
        next(error);
    }
}
);

categoryRouter.post(
"/",
requiresAuthentication,
[
    body("name").notEmpty().withMessage("Der Name der Kategorie darf nicht leer sein"),
    body("description").optional().isString().withMessage("Ungültige Beschreibung"),
],
async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const newCategory = await createCategory(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        logger.error("Fehler beim Erstellen einer Kategorie:", error);
        res.status(500).json({ message: "Fehler beim Erstellen einer Kategorie", error });
    }
}
);

categoryRouter.put(
"/:id",
requiresAuthentication,
[
    param("id").isMongoId().withMessage("Ungültige Kategorie-ID"),
    body("name").notEmpty().withMessage("Der Name der Kategorie darf nicht leer sein"),
    body("description").optional().isString().withMessage("Ungültige Beschreibung"),
],
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const categoryResource: CategoryResource = {
            id: req.params.id,
            name: req.body.name,
            description: req.body.description,
        };
        const updatedCategory = await updateCategory(categoryResource);
        if (!updatedCategory) {
            res.status(404).json({
                message: `Keine Kategorie mit der ID ${req.params.id} gefunden, Update nicht möglich`,
            });
            return;
        }
        res.json(updatedCategory);
    } catch (error) {
        logger.error("Fehler beim Aktualisieren einer Kategorie:", error);
        next(error);
    }
}
);

categoryRouter.delete(
"/:id",
requiresAuthentication,
async (req: Request, res: Response) => {
    try {
        const deletedCategory = await deleteCategory(req.params.id);
        if (!deletedCategory) {
            res.status(404).json({ message: "Kategorie nicht gefunden oder bereits gelöscht" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        logger.error("Fehler beim Löschen einer Kategorie:", error);
        res.status(500).json({ message: "Fehler beim Löschen einer Kategorie", error });
    }
}
);

export { categoryRouter };