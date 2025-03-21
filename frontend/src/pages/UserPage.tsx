// src/pages/UserPage.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function UserPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container my-4">
        <h2>Benutzerbereich</h2>
        <p>Bitte melde dich an, um deine persönlichen Informationen und Funktionen zu sehen.</p>
      </div>
    );
  }

  // Angenommen, user.role ist entweder "admin", "seller" oder "buyer"
  const { username, role } = user;

  return (
    <div className="container my-4">
      <h2>Willkommen, {username}!</h2>
      {role === "admin" && (
        <div>
          <h3>Admin Dashboard</h3>
          <p>Als Administrator hast du Zugriff auf alle Bereiche:</p>
          <ul>
            <li>Benutzer verwalten</li>
            <li>Produkte verwalten</li>
            <li>Bestellungen überprüfen</li>
            <li>Berichte einsehen</li>
          </ul>
        </div>
      )}
      {role === "seller" && (
        <div>
          <h3>Seller Dashboard</h3>
          <p>Hier kannst du deine Produkte und Bestellungen verwalten:</p>
          <ul>
            <li>Eigene Produkte hinzufügen, bearbeiten oder löschen</li>
            <li>Bestellübersicht einsehen</li>
            <li>Umsatzstatistiken abrufen</li>
          </ul>
        </div>
      )}
      {role === "buyer" && (
        <div>
          <h3>Buyer Dashboard</h3>
          <p>Hier findest du deine persönlichen Informationen und Bestellungen:</p>
          <ul>
            <li>Deine Bestellhistorie ansehen</li>
            <li>Persönliche Daten bearbeiten</li>
            <li>Adressverwaltung</li>
          </ul>
        </div>
      )}
    </div>
  );
}
