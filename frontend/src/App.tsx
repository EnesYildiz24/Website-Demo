// src/App.tsx
import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";

function App() {
  // Optional: State für userRole (hier per default null)
  const [userRole, setUserRole] = useState<"admin" | "seller" | "buyer" | null>(
    null
  );

  return (
    <div>
      {/* Beispiel einer ganz simplen Navigation */}
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> |{" "}
        <Link to="/products">Produkte</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* LoginPage erhält callback-Funktion, um role zu setzen */}
        <Route
          path="/login"
          element={
            <LoginPage
              onLoginSuccess={(role) => {
                setUserRole(role);
              }}
            />
          }
        />
        {/* ProductsPage bekommt userRole als Prop */}
        <Route
          path="/products"
          element={<ProductsPage userRole={userRole} />}
        />
      </Routes>
    </div>
  );
}

export default App;
