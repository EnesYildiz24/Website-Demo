// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../services/api";

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
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        // Verwende beispielsweise die ersten 4 Produkte als Featured
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
        setError("Produkte konnten nicht geladen werden");
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
      <div
        className="container-fluid p-0 hero-section"
        style={{
          backgroundImage: "url('http://localhost:3000/static/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "80vh",
          position: "relative",
        }}
      >
        <div
          className="overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        ></div>
        <div
          className="container position-relative d-flex flex-column justify-content-center align-items-center text-center"
          style={{ height: "80vh" }}
        >
          <h1 className="display-3 fw-bold text-white">Willkommen im Marketplace</h1>
          <p className="lead text-white">
            Finde die neuesten Trends und exklusive Angebote.
          </p>
          <Link to="/products" className="btn btn-light btn-lg mt-3">
            Jetzt einkaufen
          </Link>
        </div>
      </div>

      <div className="container my-5">
        <h2 className="mb-4 text-center">Featured Products</h2>
        {error && <p className="text-danger text-center">{error}</p>}
        <div className="row">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div className="col-md-3 mb-4" key={product.id}>
                <div className="card h-100 product-card shadow-sm">
                  <Link
                    to={`/product/${product.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        className="card-img-top"
                        alt={product.titel}
                        style={{
                          height: "200px",
                          objectFit: "cover",
                          borderTopLeftRadius: "calc(0.25rem - 1px)",
                          borderTopRightRadius: "calc(0.25rem - 1px)",
                        }}
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
                      <h5 className="card-title">{product.titel}</h5>
                      <p className="card-text flex-grow-1">{product.description}</p>
                      <p className="fw-bold">{product.price.toFixed(2)} €</p>
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">Keine Produkte verfügbar.</p>
          )}
        </div>
      </div>

      <div className="container my-5">
        <h2 className="mb-4 text-center">Browse Categories</h2>
        <div className="row">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div className="col-md-3 mb-3" key={cat.id}>
                <div className="card shadow-sm">
                  <img
                    src={`http://localhost:3000/static/images/category-${cat.name.toLowerCase()}.jpg`}
                    className="card-img-top"
                    alt={cat.name}
                    style={{ height: "150px", objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title">{cat.name}</h5>
                    <p className="card-text">{cat.description}</p>
                    <Link
                      to={`/products?category=${cat.name.toLowerCase()}`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">Keine Kategorien verfügbar.</p>
          )}
        </div>
      </div>

      <footer className="bg-dark text-white text-center py-3">
        <div className="container">
          <p className="mb-0">&copy; {new Date().getFullYear()} Marketplace Inc.</p>
        </div>
      </footer>
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
    </>
  );
}
