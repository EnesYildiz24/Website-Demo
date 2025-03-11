// src/pages/ProductsPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts, createProduct, deleteProduct } from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";

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
  const [loading, setLoading] = useState(true);

  // Lese den Query-Parameter "category" aus und wandle ihn in Kleinbuchstaben um
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category")?.toLowerCase();

  async function loadProducts() {
    try {
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    } catch {
      setError("Produkte konnten nicht geladen werden");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  if(loading) { 
    return <LoadingIndicator />;
  } 
  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const created = await createProduct(newProduct);
      setProducts((prev) => [...prev, created]);
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

  // Gruppiere die Produkte nach Kategorie (alles in Kleinbuchstaben)
  const groupedProducts = products.reduce((groups: { [key: string]: Product[] }, product) => {
    const category = product.category ? product.category.toLowerCase() : "unbekannt";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as { [key: string]: Product[] });

  // Falls ein Filter gesetzt ist, zeige nur diese Gruppe an.
  const displayedGroups = categoryFilter
    ? { [categoryFilter]: groupedProducts[categoryFilter] || [] }
    : groupedProducts;

  return (
    <div className="container my-4">
      {/* Inline CSS für Hover-Effekt */}
      <style>
        {`
          .product-card {
            transition: transform 0.3s ease;
          }
          .product-card:hover {
            transform: scale(1.05);
          }
        `}
      </style>

      <h2 className="mb-4">Produkt-Übersicht</h2>
      {error && <p className="text-danger">{error}</p>}

      {/* Produkte gruppiert nach Kategorie */}
      {Object.keys(displayedGroups).length === 0 ? (
        <p>Keine Produkte verfügbar.</p>
      ) : (
        Object.keys(displayedGroups).map((category) => (
          <div key={category} className="mb-5">
            <h3 className="mb-3">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <div className="row">
              {displayedGroups[category].map((p) => (
                <div className="col-md-4 mb-4" key={p.id}>
                  <div className="card h-100 product-card">
                    {/* Das Bild und der obere Bereich sind als Link verpackt */}
                    <Link
                      to={`/product/${p.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0]}
                          className="card-img-top"
                          alt={p.titel}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "200px",
                            backgroundColor: "#ddd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          Kein Bild
                        </div>
                      )}
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{p.titel}</h5>
                        <p className="text-muted">{p.category}</p>
                        <p className="card-text flex-grow-1">{p.description}</p>
                        <p className="fw-bold">{p.price.toFixed(2)} €</p>
                      </div>
                    </Link>
                    {(userRole === "admin" || userRole === "seller") && (
                      <button
                        className="btn btn-danger mt-2"
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Formular zum Anlegen eines neuen Produkts */}
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
