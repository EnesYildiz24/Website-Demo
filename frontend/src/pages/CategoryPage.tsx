// src/pages/CategoryPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../services/api"; // API-Funktion, die Kategorien lädt

interface Category {
  id?: string;
  name: string;
  description: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Fehler beim Laden der Kategorien:", err);
        setError("Kategorien konnten nicht geladen werden");
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="container my-4">
      <h2 className="mb-4">Kategorien</h2>
      {error && <p className="text-danger">{error}</p>}
      <div className="row">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div className="col-md-3 mb-3" key={cat.id}>
              <div className="card">
                {/* Hier kannst du eventuell ein Bild oder Icon einfügen */}
                <div className="card-body text-center">
                  <h5 className="card-title">{cat.name}</h5>
                  <p className="card-text">{cat.description}</p>
                  {/* Beim Klick wird zur ProductsPage mit einem Query-Parameter navigiert */}
                  <Link
                    to={`/products?category=${cat.name.toLowerCase()}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Produkte anzeigen
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
  );
}
