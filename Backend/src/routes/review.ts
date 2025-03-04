import { Router, Request, Response, NextFunction } from "express";
import { ReviewResource } from "../Resources";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import { optionalAuthentication, requiresAuthentication } from "./authenticator";
import {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
} from "../services/ReviewService";

const reviewRouter = Router();

reviewRouter.get(
"/",
optionalAuthentication,
async (req: Request, res: Response) => {
    try {
        const reviews = await getAllReviews();
        res.json(reviews);
    } catch (error) {
        logger.error("Fehler beim Abrufen der Reviews:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Reviews", error });
    }
}
);

reviewRouter.get(
"/:id",
optionalAuthentication,
param("id").isMongoId().withMessage("Ungültige Review-ID"),
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const review = await getReview(req.params.id);
        if (!review) {
            res.status(404).json({
                message: `Keine Review mit der ID ${req.params.id} gefunden`,
            });
            return;
        }
        res.json(review);
    } catch (error) {
        logger.error("Fehler beim Abrufen einer Review:", error);
        res.status(500).json({ message: "Fehler beim Abrufen einer Review", error });
        next(error);
    }
}
);

reviewRouter.post(
"/",
requiresAuthentication,
[
    body("reviewerId").isMongoId().withMessage("Ungültige Reviewer-ID"),
    body("productId").optional().isMongoId().withMessage("Ungültige Produkt-ID"),
    body("sellerId").optional().isMongoId().withMessage("Ungültige Verkäufer-ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Bewertung muss zwischen 1 und 5 liegen"),
    body("comment").notEmpty().withMessage("Kommentar darf nicht leer sein"),
],
async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const newReview = await createReview(req.body);
        res.status(201).json(newReview);
    } catch (error) {
        logger.error("Fehler beim Erstellen einer Review:", error);
        res.status(500).json({ message: "Fehler beim Erstellen einer Review", error });
    }
}
);

reviewRouter.put(
"/:id",
requiresAuthentication,
[
    param("id").isMongoId().withMessage("Ungültige Review-ID"),
    body("reviewerId").isMongoId().withMessage("Ungültige Reviewer-ID"),
    body("productId").optional().isMongoId().withMessage("Ungültige Produkt-ID"),
    body("sellerId").optional().isMongoId().withMessage("Ungültige Verkäufer-ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Bewertung muss zwischen 1 und 5 liegen"),
    body("comment").notEmpty().withMessage("Kommentar darf nicht leer sein"),
],
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const reviewResource: ReviewResource = {
            id: req.params.id,
            reviewerId: req.body.reviewerId,
            productId: req.body.productId,
            sellerId: req.body.sellerId,
            rating: req.body.rating,
            comment: req.body.comment,
        };
        const updatedReview = await updateReview(reviewResource);
        if (!updatedReview) {
            res.status(404).json({
                message: `Keine Review mit der ID ${req.params.id} gefunden, Update nicht möglich`,
            });
            return;
        }
        res.json(updatedReview);
    } catch (error) {
        logger.error("Fehler beim Aktualisieren einer Review:", error);
        next(error);
    }
}
);

reviewRouter.delete(
"/:id",
requiresAuthentication,
async (req: Request, res: Response) => {
    try {
        const deletedReview = await deleteReview(req.params.id);
        if (!deletedReview) {
            res.status(404).json({ message: "Review nicht gefunden oder bereits gelöscht" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Fehler beim Löschen einer Review", error });
    }
}
);

export { reviewRouter };