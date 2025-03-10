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
    } catch {
      setError("Produkt konnte nicht gelöscht werden");
    }
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">Produkt-Übersicht</h2>
      {error && <p className="text-danger">{error}</p>}

      {/* Produkt-Grid */}
      <div className="row">
        {products.map((p) => (
          <div className="col-md-4 mb-4" key={p.id}>
            <div className="card h-100">
              {/* falls ein Bild existiert, nutze das erste Bild */}
              {p.images && p.images.length > 0 && (
                <img
                  src={p.images[0]}
                  className="card-img-top"
                  alt={p.titel}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{p.titel}</h5>
                <p className="text-muted">{p.category}</p>
                <p className="card-text flex-grow-1">{p.description}</p>
                <p className="fw-bold">{p.price.toFixed(2)} €</p>
                {(userRole === "admin" || userRole === "seller") && (
                  <button
                    className="btn btn-danger mt-auto"
                    onClick={() => handleDeleteProduct(p.id)}
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nur Admins oder Seller dürfen ein neues Produkt anlegen */}
      {(userRole === "admin" || userRole === "seller") && (
        <div className="border-top pt-4 mt-4">
          <h3 className="mb-3">Neues Produkt anlegen</h3>
          <form onSubmit={handleCreateProduct}>
            <div className="mb-3">
              <label className="form-label">Titel</label>
              <input
                type="text"
                className="form-control"
                value={newProduct.titel}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    titel: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Beschreibung</label>
              <textarea
                className="form-control"
                rows={2}
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Preis</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value),
                  }))
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Bilder (kommasepariert)</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => {
                  const urls = e.target.value
                    .split(",")
                    .map((url) => url.trim())
                    .filter(Boolean);
                  setNewProduct((prev) => ({ ...prev, images: urls }));
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Kategorie</label>
              <input
                type="text"
                className="form-control"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Erstellen
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
