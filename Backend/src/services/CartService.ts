// src/services/cartService.ts
import Cart from "../model/CartModel";
import { Types } from "mongoose";

export async function getCartByUser(userId: string) {
  return await Cart.findOne({ user: userId }).populate("items.product");
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }
  const existingItem = cart.items.find(item => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: new Types.ObjectId(productId), quantity });
}
  return await cart.save();
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Warenkorb nicht gefunden");
  }
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  return await cart.save();
}

export async function clearCart(userId: string) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Warenkorb nicht gefunden");
  }
  cart.items = [];
  return await cart.save();
}
