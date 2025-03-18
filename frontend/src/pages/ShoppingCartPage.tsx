// src/pages/ShoppingCartPage.tsx
import React, { useEffect, useState } from "react";
import { getCart, removeFromCart, clearCart } from "../services/api";

interface CartItem {
  product: {
    _id: string;
    titel: string;
    price: number;
  };
  quantity: number;
}

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCart() {
    try {
      const data = await getCart();
      setCartItems(data?.items || []);
    } catch (err) {
      setError("Fehler beim Laden des Warenkorbs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function handleRemove(productId: string) {
    try {
      await removeFromCart(productId);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearCart() {
    try {
      await clearCart();
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p>Lade Warenkorb...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h2>Warenkorb</h2>
      {cartItems.length === 0 ? (
        <p>Dein Warenkorb ist leer.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.product._id} style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}>
              <h4>{item.product.titel}</h4>
              <p>Menge: {item.quantity}</p>
              <p>Preis: {item.product.price.toFixed(2)} €</p>
              <button onClick={() => handleRemove(item.product._id)}>Entfernen</button>
            </div>
          ))}
          <button onClick={handleClearCart}>Warenkorb leeren</button>
        </div>
      )}
    </div>
  );
}
