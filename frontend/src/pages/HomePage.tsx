// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { fetchCategories } from "../services/api"; // Neue Funktion zum Abrufen der Kategorien

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

interface Category {
  id?: string;
  name: string;
  description?: string;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        // Nimm hier beispielsweise die ersten 4 Produkte als Featured
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
      }
    }
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Fehler beim Laden der Kategorien:", error);
      }
    }
    loadProducts();
    loadCategories();
  }, []);

  return (
    <>
      {/* Hero-Section */}
      <div className="container-fluid bg-primary text-white py-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Willkommen im Marketplace</h1>
          <p className="lead">
            Entdecke eine Vielzahl von Produkten, exklusive Angebote und vieles mehr.
          </p>
          <Link to="/products" className="btn btn-light btn-lg">
            Jetzt einkaufen
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container my-5">
        <h2 className="mb-4">Featured Products</h2>
        <div className="row">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((p) => (
              <div className="col-md-3 mb-4" key={p.id}>
                <div className="card h-100">
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
                    <p className="card-text flex-grow-1">{p.description}</p>
                    <p className="fw-bold">{p.price.toFixed(2)} €</p>
                    <Link to={`/product/${p.id}`} className="btn btn-outline-primary mt-auto">
                      Details ansehen
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Keine Produkte verfügbar.</p>
          )}
        </div>
      </div>

      {/* Dynamische Kategorien */}
      <div className="container my-5">
        <h2 className="mb-4">Browse Categories</h2>
        <div className="row">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div className="col-md-3 mb-3" key={cat.id}>
                <div className="card">
                  <img
                    src={`http://localhost:3000/static/images/category-${cat.name.toLowerCase()}.jpg`}
                    className="card-img-top"
                    alt={cat.name}
                    style={{ height: "150px", objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title">{cat.name}</h5>
                    <Link to={`/products?category=${cat.name.toLowerCase()}`} className="btn btn-outline-secondary btn-sm">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Keine Kategorien verfügbar.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <div className="container">
          <p className="mb-0">&copy; {new Date().getFullYear()} Marketplace Inc.</p>
        </div>
      </footer>
    </>
  );
}
