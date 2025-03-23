import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function UserPage() {
  const { user } = useAuth();

  if (!user) {
    return <NotLoggedInView />;
  }

  const { username, role } = user;

  return (
    <div className="container my-4">
      <h2>Willkommen, {username}!</h2>

      {role === "admin" && (
        <div className="admin-dashboard">
          <h3>Admin Dashboard</h3>
          <div className="row mt-3">
            <div className="col-md-6 mb-3">
              <div className="p-3 border bg-light">
                <h5>Benutzer verwalten</h5>
                <p>Füge neue Benutzer hinzu, bearbeite oder lösche bestehende.</p>
                <Link to="/admin/users" className="btn btn-primary">
                  Verwalten
                </Link>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="p-3 border bg-light">
                <h5>Produkte verwalten</h5>
                <p>Verwalte alle Produkte, unabhängig vom Besitzer.</p>
                <Link to="/admin/products" className="btn btn-primary">
                  Verwalten
                </Link>
              </div>
            </div>
          </div>
          {/* usw... */}
        </div>
      )}

      {role === "seller" && (
        <div className="seller-dashboard mt-4">
          <h3>Seller Dashboard</h3>
          <p>Hier kannst du deine Produkte und Bestellungen verwalten:</p>
          <ul>
            <li><Link to="/seller/products">Eigene Produkte verwalten</Link></li>
            <li><Link to="/seller/orders">Bestellübersicht</Link></li>
            <li><Link to="/seller/stats">Umsatzstatistiken</Link></li>
          </ul>
        </div>
      )}

      {role === "buyer" && (
        <div className="buyer-dashboard mt-4">
          <h3>Buyer Dashboard</h3>
          <p>Hier findest du deine persönlichen Informationen und Bestellungen:</p>
          <ul>
            <li><Link to="/buyer/orders">Bestellhistorie</Link></li>
            <li><Link to="/buyer/profile">Persönliche Daten bearbeiten</Link></li>
            <li><Link to="/buyer/addresses">Adressverwaltung</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}

function NotLoggedInView() {
  return (
    <div className="container my-4">
      <h2>Benutzerbereich</h2>
      <p>Bitte melde dich an, um deine persönlichen Informationen und Funktionen zu sehen.</p>
    </div>
  );
}
