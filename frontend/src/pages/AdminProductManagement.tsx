// src/pages/AdminProductManagement.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchProducts,
  createProduct,
  deleteProduct,
} from "../services/api";

interface Product {
  _id: string;         // oder id: string
  titel: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

export default function AdminProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Formular für neue Produkte
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newCategory, setNewCategory] = useState("");
  const [newImages, setNewImages] = useState<string>(""); 
  // Du könntest das z. B. als kommagetrennte Liste eingeben und parsen

  useEffect(() => {
    // Admin-only logic
    if (!user || user.role !== "admin") {
      return;
    }

    setLoading(true);
    fetchProducts()
      .then((data) => {
        // data sollte ein Array von Products sein
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Fehler beim Laden der Produkte");
        setLoading(false);
      });
  }, [user]);

  // Produkt löschen
  const handleDelete = async (productId: string) => {
    if (!user || user.role !== "admin") return;

    try {
      await deleteProduct(productId);
      // Lokal aus der Liste entfernen
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error(err);
      setError("Fehler beim Löschen eines Produkts");
    }
  };

  // Neues Produkt anlegen
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "admin") return;

    try {
      const created = await createProduct({
        titel: newTitle,
        description: newDescription,
        price: newPrice,
        category: newCategory,
        images: newImages ? newImages.split(",") : [],
      });
      setProducts((prev) => [...prev, created]);
      // Felder leeren
      setNewTitle("");
      setNewDescription("");
      setNewPrice(0);
      setNewCategory("");
      setNewImages("");
    } catch (err) {
      console.error(err);
      setError("Fehler beim Erstellen eines Produkts");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container">
        <h2>Kein Zugriff!</h2>
        <p>Nur Admins dürfen diese Seite sehen.</p>
      </div>
    );
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
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.titel}</td>
              <td>{p.description}</td>
              <td>{p.price}</td>
              <td>{p.category}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(p._id)}
                >
                  Löschen
                </button>
                {/* Später: Edit-Funktion */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formular zum Anlegen eines neuen Produkts */}
      <hr />
      <h4>Neues Produkt anlegen</h4>
      <form onSubmit={handleCreate} style={{ maxWidth: "400px" }}>
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
            rows={3}
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
        <button type="submit" className="btn btn-primary">
          Erstellen
        </button>
      </form>
    </div>
  );
}
