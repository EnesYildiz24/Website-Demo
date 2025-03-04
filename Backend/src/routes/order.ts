import { Router, Request, Response, NextFunction } from "express";
import { OrderResource } from "../Resources";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import { optionalAuthentication, requiresAuthentication } from "./authenticator";
import { getAllOrders, createOrder, updateOrder, deleteOrder, getOrder } from "../services/OrderService";

const orderRouter = Router();

orderRouter.get(
"/",
optionalAuthentication,
async (req: Request, res: Response) => {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (error) {
        logger.error("Fehler beim Abrufen der Bestellungen:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Bestellungen", error });
    }
}
);

orderRouter.get(
"/:id",
optionalAuthentication,
param("id").isMongoId().withMessage("Ungültige Bestell-ID"),
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const order = await getOrder(req.params.id);
        if (!order) {
            res.status(404).json({
                message: `Keine Bestellung mit der ID ${req.params.id} gefunden`,
            });
            return;
        }
        res.json(order);
    } catch (error) {
        logger.error("Fehler beim Abrufen einer Bestellung:", error);
        res.status(500).json({ message: "Fehler beim Abrufen einer Bestellung", error });
        next(error);
    }
}
)

orderRouter.post(
"/",
requiresAuthentication,
[
    body("buyerId").isMongoId().withMessage("Ungültige Käufer-ID"),
    body("productId").isMongoId().withMessage("Ungültige Produkt-ID"),
    body("orderDate").isISO8601().withMessage("Ungültiges Bestelldatum"),
    body("status").isIn(["pending", "completed", "cancelled"]).withMessage("Ungültiger Bestellstatus"),
    body("paymentInfo").notEmpty().withMessage("Zahlungsinformationen dürfen nicht leer sein"),
],
async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const newOrder = await createOrder(req.body);
        res.status(201).json(newOrder);
    } catch (error) {
        logger.error("Fehler beim Erstellen einer Bestellung:", error);
        res.status(500).json({ message: "Fehler beim Erstellen einer Bestellung", error });
    }
}
);

orderRouter.put(
"/:id",
requiresAuthentication,
[
    param("id").isMongoId().withMessage("Ungültige Bestell-ID"),
    body("buyerId").isMongoId().withMessage("Ungültige Käufer-ID"),
    body("productId").isMongoId().withMessage("Ungültige Produkt-ID"),
    body("orderDate").isISO8601().withMessage("Ungültiges Bestelldatum"),
    body("status").isIn(["pending", "completed", "cancelled"]).withMessage("Ungültiger Bestellstatus"),
    body("paymentInfo").notEmpty().withMessage("Zahlungsinformationen dürfen nicht leer sein"),
],
async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const orderResource: OrderResource = {
            id: req.params.id,
            buyerId: req.body.buyerId,
            productId: req.body.productId,
            orderDate: req.body.orderDate,
            status: req.body.status,
            paymentInfo: req.body.paymentInfo,
        };
        const updatedOrder = await updateOrder(orderResource);
        if (!updatedOrder) {
            res.status(404).json({
                message: `Keine Bestellung mit der ID ${req.params.id} gefunden, Update nicht möglich`,
            });
            return;
        }
        res.json(updatedOrder);
    } catch (error) {
        logger.error("Fehler beim Aktualisieren einer Bestellung:", error);
        next(error);
    }
}
);

orderRouter.delete(
"/:id",
requiresAuthentication,
async (req: Request, res: Response) => {
    try {
        const deletedOrder = await deleteOrder(req.params.id);
        if (!deletedOrder) {
            res.status(404).json({ message: "Bestellung nicht gefunden oder bereits gelöscht" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Fehler beim Löschen einer Bestellung", error });
    }
}
);

export { orderRouter };