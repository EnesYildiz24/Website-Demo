// src/routes/cartRouter.ts
import express, { Request, Response, Router } from "express";
import {
  getCartByUser,
  addToCart,
  removeFromCart,
  clearCart,
} from "../services/CartService";
import {
  optionalAuthentication,
  requiresAuthentication,
} from "./authenticator";

const cartRouter = Router();

cartRouter.get("/", requiresAuthentication, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  try {
    const cart = await getCartByUser(req.user._id);
    res.json(cart); // Kein "return" hier
  } catch (error) {
    console.error("Fehler beim Laden des Warenkorbs:", error);
    res.status(500).json({ message: "Fehler beim Laden des Warenkorbs" });
  }
});

// POST: Produkt zum Warenkorb hinzufügen
cartRouter.post("/add", requiresAuthentication, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  try {
    const { productId, quantity } = req.body;
    const cart = await addToCart(req.user._id, productId, quantity);
    res.json(cart);
  } catch (error) {
    console.error("Fehler beim Hinzufügen zum Warenkorb:", error);
    res.status(500).json({ message: "Fehler beim Hinzufügen zum Warenkorb" });
  }
});

// DELETE: Produkt aus dem Warenkorb entfernen
cartRouter.delete(
  "/remove/:productId",
  requiresAuthentication,
  async (req, res) => {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return
    }
    try {
      const cart = await removeFromCart(req.user._id, req.params.productId);
      res.json(cart);
    } catch (error) {
      console.error("Fehler beim Entfernen aus dem Warenkorb:", error);
      res
        .status(500)
        .json({ message: "Fehler beim Entfernen aus dem Warenkorb" });
    }
  }
);

// DELETE: gesamten Warenkorb leeren
cartRouter.delete(
  "/clear",
  requiresAuthentication,
  async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return
    }
    try {
      const cart = await clearCart(req.user._id);
      res.json(cart);
    } catch (error) {
      console.error("Fehler beim Leeren des Warenkorbs:", error);
      res.status(500).json({ message: "Fehler beim Leeren des Warenkorbs" });
    }
  }
);

export {cartRouter};
