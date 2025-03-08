// src/pages/ProductsPage.tsx
import React, { useEffect, useState } from "react";
import {
  fetchProducts,
  createProduct,
  deleteProduct,
} from "../services/api";

interface Product {
  id?: string;
  titel: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  userRole: "admin" | "seller" | "buyer" | null;
}

export default function ProductsPage({ userRole }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Product>({
    titel: "",
    description: "",
    price: 0,
    images: [],
    category: "",
  });
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      setError("Produkte konnten nicht geladen werden");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const created = await createProduct(newProduct);
      setProducts((prev) => [...prev, created]);
      // Formular zurücksetzen
      setNewProduct({
        titel: "",
        description: "",
        price: 0,
        images: [],
        category: "",
      });
    } catch {
      setError("Produkt konnte nicht erstellt werden");
    }
  }

  async function handleDeleteProduct(id: string | undefined) {
    if (!id) return;
    setError("");
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch{
      setError("Produkt konnte nicht gelöscht werden");
    }
  }

  return (
    <div>
      <h2>Produkt-Übersicht</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <strong>{p.titel}</strong> – {p.description} – {p.price}€ – ({p.category})
            {userRole === "admin" || userRole === "seller" ? (
              <button onClick={() => handleDeleteProduct(p.id)}>Löschen</button>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Nur Admins oder Seller dürfen ggf. neue Produkte anlegen */}
      {(userRole === "admin" || userRole === "seller") && (
        <form onSubmit={handleCreateProduct}>
          <h3>Neues Produkt anlegen</h3>
          <div>
            <label>Titel: </label>
            <input
              type="text"
              value={newProduct.titel}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, titel: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label>Beschreibung: </label>
            <input
              type="text"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, description: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label>Preis: </label>
            <input
              type="number"
              value={newProduct.price}
              step={0.01}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value),
                }))
              }
              required
            />
          </div>
          <div>
            <label>Images (kommasepariert): </label>
            <input
              type="text"
              onChange={(e) => {
                const urls = e.target.value
                  .split(",")
                  .map((url) => url.trim())
                  .filter(Boolean);
                setNewProduct((prev) => ({ ...prev, images: urls }));
              }}
            />
          </div>
          <div>
            <label>Kategorie: </label>
            <input
              type="text"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, category: e.target.value }))
              }
              required
            />
          </div>

          <button type="submit">Erstellen</button>
        </form>
      )}
    </div>
  );
}
