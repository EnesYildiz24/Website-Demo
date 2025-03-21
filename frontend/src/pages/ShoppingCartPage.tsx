// src/pages/ShoppingCartPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeFromCart, clearCart, checkout } from "../services/api";

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
  const navigate = useNavigate();

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

  async function handleCheckout() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = await checkout(); 
      alert("Bestellung erfolgreich erstellt!");
      navigate("/orders");
    } catch (err) {
      console.error("Fehler beim Checkout", err);
      alert("Fehler beim Checkout");
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
          {cartItems.map((item, index) => {
            if (!item.product) {
              return (
                <div
                  key={index}
                  style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}
                >
                  <p>Produkt nicht verfügbar</p>
                </div>
              );
            }
            return (
              <div
                key={item.product._id}
                style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}
              >
                <h4>{item.product.titel}</h4>
                <p>Menge: {item.quantity}</p>
                <p>Preis: {item.product.price.toFixed(2)} €</p>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemove(item.product._id)}
                >
                  Entfernen
                </button>
              </div>
            );
          })}
          <div style={{ marginTop: "1rem" }}>
            <button className="btn btn-secondary" onClick={handleClearCart}>
              Warenkorb leeren
            </button>
            <button
              className="btn btn-primary ms-3"
              onClick={handleCheckout}
            >
              Zur Kasse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
