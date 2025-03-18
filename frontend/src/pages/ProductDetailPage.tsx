// src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchProducts,
  fetchReviews,
  submitReview,
  deleteReview,
  addToCart,
} from "../services/api";
import LoadingIndicator from "../components/LoadingIndicator";
import { useAuth } from "../context/AuthContext";

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

interface Review {
  _id: string;
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerId: string;
}

// Neue Komponente für die Sterne-Bewertung
interface StarRatingProps {
  rating: number;
  onRatingChange: (newRating: number) => void;
}
function StarRating({ rating, onRatingChange }: StarRatingProps) {
  return (
    <div style={{ display: "flex", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((num) => (
        <span
          key={num}
          onClick={() => onRatingChange(num)}
          style={{
            fontSize: "2rem",
            color: num <= rating ? "gold" : "gray",
            marginRight: "0.25rem",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "1rem",
  borderRadius: "4px",
  maxWidth: "400px",
  width: "100%",
  textAlign: "center",
};

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  console.log("Aktueller User:", user);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [refreshReviews, setRefreshReviews] = useState(false);

  // State für modales Bestätigungsfenster
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewIdToDelete, setReviewIdToDelete] = useState<string | null>(null);

  async function handleAddToCart() {
    if (!product || !product.id) {
      alert("Produkt nicht gefunden.");
      return;
    }
    try {
      await addToCart(product.id, 1);
      alert("Produkt wurde zum Warenkorb hinzugefügt!");
    } catch (error) {
      console.error("Fehler beim Hinzufügen:", error);
      alert("Fehler beim Hinzufügen zum Warenkorb");
    }
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        if (productId) {
          const products = await fetchProducts();
          const data = products.find((p: Product) => p.id === productId);
          setProduct(data);
          const reviewsData = await fetchReviews(productId);
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error(err);
        setError("Fehler beim Laden des Produkts oder der Bewertungen");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  // Reviews neu laden, wenn sich refreshReviews ändert
  useEffect(() => {
    async function loadReviews() {
      if (productId) {
        try {
          const reviewsData = await fetchReviews(productId);
          setReviews(reviewsData);
        } catch (err) {
          console.error("Fehler beim Aktualisieren der Reviews:", err);
        }
      }
    }
    loadReviews();
  }, [refreshReviews, productId]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setReviewError("");
    try {
      // Übergibt den aktuellen Benutzernamen oder den Fallback
      await submitReview(
        productId!,
        rating,
        comment,
        user?.username || "Unbekannter Nutzer"
      );
      setRefreshReviews((prev) => !prev);
      setRating(5);
      setComment("");
    } catch {
      setReviewError("Fehler beim Absenden der Bewertung");
    } finally {
      setSubmitting(false);
    }
  }

  // Statt direktem Löschen wird jetzt das modale Fenster angezeigt
  function handleShowDeleteModal(reviewId: string) {
    setReviewIdToDelete(reviewId);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    if (!reviewIdToDelete) return;
    try {
      await deleteReview(reviewIdToDelete);
      setReviews((prev) =>
        prev.filter(
          (review) =>
            review.id !== reviewIdToDelete && review._id !== reviewIdToDelete
        )
      );
    } catch (err) {
      console.error("Fehler beim Löschen der Bewertung:", err);
    } finally {
      setShowDeleteModal(false);
      setReviewIdToDelete(null);
    }
  }

  if (loading) return <LoadingIndicator />;
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

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "Keine Bewertungen";

  return (
    <div className="container my-4">
      <Link to="/products" className="btn btn-secondary mb-3">
        Zurück zur Produktübersicht
      </Link>
      <div className="card">
        {product.images.length > 0 ? (
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
          <h4>⭐ Durchschnittliche Bewertung: {averageRating}</h4>
          <button className="btn btn-success mt-3" onClick={handleAddToCart}>
            In den Warenkorb
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3>Bewertungen</h3>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={review.id || review._id || index}
              className="card mb-3 shadow-sm"
            >
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: "40px", height: "40px" }}
                  >
                    {review.reviewerName
                      ? review.reviewerName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div>
                    <h5 className="mb-0">
                      {review.reviewerName || "Unbekannter Nutzer"}
                    </h5>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <h6 className="card-subtitle mb-2 text-muted">
                  ⭐ {review.rating}/5
                </h6>
                <p className="card-text">{review.comment}</p>
                {(user?.role === "admin" || user?.id === review.reviewerId) && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleShowDeleteModal(review.id)}
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Keine Bewertungen vorhanden.</p>
        )}
      </div>

      {/* Formular für neue Bewertung */}
      <div className="mt-4">
        <h3>Bewertung abgeben</h3>
        {reviewError && <p className="text-danger">{reviewError}</p>}
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-3">
            <label htmlFor="rating" className="form-label">
              Bewertung (1-5 Sterne):
            </label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="mb-3">
            <label htmlFor="comment" className="form-label">
              Kommentar:
            </label>
            <textarea
              id="comment"
              className="form-control"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Absenden..." : "Bewertung abgeben"}
          </button>
        </form>
      </div>

      {/* Modales Bestätigungsfenster für das Löschen */}
      {showDeleteModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <p>Sind Sie sicher, dass Sie diese Bewertung löschen möchten?</p>
            <div style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-danger me-2"
                onClick={handleConfirmDelete}
              >
                Ja
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setReviewIdToDelete(null);
                }}
              >
                Nein
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
