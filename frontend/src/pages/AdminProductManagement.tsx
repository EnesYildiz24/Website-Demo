// src/pages/AdminProductManagement.tsx
import React, { useEffect, useState } from "react";
import {
  fetchProducts,
  createProduct,
  deleteProduct,
} from "../services/api";

interface Product {
  id: string;
  titel: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  seller?: string;         // neu: Seller-ID
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminProductManagement() {
  // State: Liste aller Produkte
  const [products, setProducts] = useState<Product[]>([]);
  // Fehler-/Ladezustände
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Formularstates für neues Produkt
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newCategory, setNewCategory] = useState("");
  const [newImages, setNewImages] = useState<string>(""); 
    // Kommagetrennte Bild-URLs
  const [newSeller, setNewSeller] = useState<string>(""); 
    // Hier gibst du die Seller-ID ein

  useEffect(() => {
    // Beim ersten Rendern: Produkte laden
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(); // -> Array von Produkten
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Fehler beim Laden der Produkte");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (!window.confirm("Willst du dieses Produkt wirklich löschen?")) {
      return;
    }
    try {
      await deleteProduct(productId);
      // Aus local state entfernen:
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
      setError("Fehler beim Löschen des Produkts");
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    // Bilder parsen
    const imageArray = newImages
      .split(",")
      .map((img) => img.trim())
      .filter((img) => img !== "");

    try {
      // Hier rufen wir createProduct(...) auf
      // und übergeben seller als newSeller
      const created = await createProduct({
        titel: newTitle,
        description: newDescription,
        price: newPrice,
        images: imageArray,
        category: newCategory,
        seller: newSeller, // <--- Wichtig
      });
      // Im local state hinzufügen:
      setProducts((prev) => [...prev, created]);

      // Formular zurücksetzen
      setNewTitle("");
      setNewDescription("");
      setNewPrice(0);
      setNewCategory("");
      setNewImages("");
      setNewSeller("");
    } catch (err) {
      console.error(err);
      setError("Fehler beim Erstellen eines Produkts");
    }
  }

  return (
    <div className="container">
      <h2>Admin: Produkte verwalten</h2>

      {loading && <p>Produkte werden geladen...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Produktliste */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Titel</th>
            <th>Beschreibung</th>
            <th>Preis</th>
            <th>Kategorie</th>
            <th>Seller</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.titel}</td>
              <td>{p.description}</td>
              <td>{p.price.toFixed(2)}</td>
              <td>{p.category}</td>
              <td>{p.seller || "keine Seller-ID"}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteProduct(p.id)}
                >
                  Löschen
                </button>
                {/* Optional: Button zum Bearbeiten */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formular zum Anlegen eines neuen Produkts */}
      <hr />
      <h4>Neues Produkt anlegen</h4>
      <form onSubmit={handleCreateProduct} style={{ maxWidth: "500px" }}>
        <div className="mb-3">
          <label className="form-label">Titel</label>
          <input
            type="text"
            className="form-control"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Beschreibung</label>
          <textarea
            className="form-control"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Preis</label>
          <input
            type="number"
            className="form-control"
            step="0.01"
            min="0"
            value={newPrice}
            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Kategorie</label>
          <input
            type="text"
            className="form-control"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Bilder (kommagetrennt)</label>
          <input
            type="text"
            className="form-control"
            value={newImages}
            onChange={(e) => setNewImages(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Seller-ID</label>
          <input
            type="text"
            className="form-control"
            value={newSeller}
            onChange={(e) => setNewSeller(e.target.value)}
            placeholder="z.B. 64bcf7..."
          />
          <small className="text-muted">
            Hier die ObjectId des Sellers (oder du nutzt ein Dropdown)
          </small>
        </div>
        <button type="submit" className="btn btn-primary">
          Erstellen
        </button>
      </form>
    </div>
  );
}
