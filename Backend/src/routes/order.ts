import { Router, Request, Response, NextFunction } from "express";
import { OrderItemResource, OrderResource } from "../Resources";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import {
  optionalAuthentication,
  requiresAuthentication,
} from "./authenticator";
import {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrder,
} from "../services/OrderService";
import { Order } from "../model/OrderModel";
import Cart from "../model/CartModel";
import { Types } from "mongoose";

const orderRouter = Router();

interface PopulatedCartItem {
    product: {
      _id: string;
      price: number;
      titel: string;
    };
    quantity: number;
  }

  interface IOrderExtended {
    _id: Types.ObjectId;
    buyerId: Types.ObjectId;
    items: { product: Types.ObjectId; quantity: number; price: number }[];
    orderDate: Date;
    status: "pending" | "completed" | "cancelled";
    paymentInfo: string;
    total: number;
  }
  
  function mapOrderToResource(o: IOrderExtended): OrderResource {
    return {
      id: o._id.toString(),
      buyerId: o.buyerId.toString(),
      items: o.items.map((item): OrderItemResource => ({
        productId: item.product.toString(),
        quantity: item.quantity,
        price: item.price,
      })),
      orderDate: o.orderDate.toISOString(),
      status: o.status,
      paymentInfo: o.paymentInfo,
      total: o.total,
    };
  }
  orderRouter.get(
    "/",
    requiresAuthentication, // Stelle sicher, dass der Nutzer authentifiziert ist
    async (req: Request, res: Response) => {
      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      try {
        const orders = await Order.find({ buyerId: req.user._id }).exec();
        res.json(orders.map((order) => {
          const o = (order.toObject() as unknown) as IOrderExtended;
          return mapOrderToResource(o);
        }));
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
      res
        .status(500)
        .json({ message: "Fehler beim Abrufen einer Bestellung", error });
      next(error);
    }
  }
);
orderRouter.post(
  "/checkout",
  requiresAuthentication,
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    try {
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: "Warenkorb ist leer." });
        return;
      }

      let total = 0;
      const orderItems = (cart.items as unknown as PopulatedCartItem[]).map((item) => {
        total += item.quantity * item.product.price;
        return {
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        };
      });

      const newOrder = new Order({
        buyerId: req.user._id,
        items: orderItems,
        orderDate: new Date(),
        status: "pending",
        paymentInfo: "noch nicht bezahlt", // Hier kannst du auch Zahlungsdetails übergeben
        total,
      });
      await newOrder.save();

      cart.items = [];
      await cart.save();

      res.status(201).json({
        message: "Bestellung erfolgreich erstellt.",
        order: newOrder,
      });
      return;
    } catch (error) {
      console.error("Fehler beim Checkout:", error);
      res.status(500).json({ message: "Fehler beim Checkout", error });
      return;
    }
  }
);

orderRouter.put(
  "/:id",
  requiresAuthentication,
  [
    param("id").isMongoId().withMessage("Ungültige Bestell-ID"),
    body("buyerId").isMongoId().withMessage("Ungültige Käufer-ID"),
    body("orderDate").isISO8601().withMessage("Ungültiges Bestelldatum"),
    body("status")
      .isIn(["pending", "completed", "cancelled"])
      .withMessage("Ungültiger Bestellstatus"),
    body("paymentInfo")
      .notEmpty()
      .withMessage("Zahlungsinformationen dürfen nicht leer sein"),
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
        items: req.body.items, 
        orderDate: req.body.orderDate,
        status: req.body.status,
        paymentInfo: req.body.paymentInfo,
        total: req.body.total,
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
        res
          .status(404)
          .json({ message: "Bestellung nicht gefunden oder bereits gelöscht" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Fehler beim Löschen einer Bestellung", error });
    }
  }
);

export { orderRouter };
