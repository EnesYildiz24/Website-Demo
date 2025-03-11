// src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
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

export default function ProductDetailPage() {
  // Erwartet, dass die Route etwa so definiert ist: /product/:productId
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        if (productId) {
          const products = await fetchProducts();
          const data = products.find(
            (product: Product) => product.id === productId
          );
          setProduct(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError("Fehler beim Laden des Produkts");
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return <LoadingIndicator />;
  }
  if (error) {
    return (
      <div className="container my-4">
        <p className="text-danger">{error}</p>
        <Link to="/products" className="btn btn-secondary">
          Zurück zur Produktübersicht
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container my-4">
        <p>Produkt wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <Link to="/products" className="btn btn-secondary mb-3">
        Zurück zur Produktübersicht
      </Link>
      <div className="card">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.titel}
            className="card-img-top"
            style={{ height: "400px", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: "400px",
              backgroundColor: "#ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Kein Bild
          </div>
        )}
        <div className="card-body">
          <h2 className="card-title">{product.titel}</h2>
          <p className="card-text">{product.description}</p>
          <p className="fw-bold">Preis: {product.price.toFixed(2)} €</p>
          <p className="text-muted">Kategorie: {product.category}</p>
        </div>
      </div>
    </div>
  );
}
