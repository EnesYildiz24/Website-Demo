// src/App.tsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import CategoryPage from "./pages/CategoryPage";

function App() {
  const [userRole, setUserRole] = useState<"admin" | "seller" | "buyer" | null>(null);

  return (
    <>
      <Navbar userRole={userRole} setUserRole={setUserRole} />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={(role) => setUserRole(role)} />}
          />
          <Route path="/products" element={<ProductsPage userRole={userRole} />} />
          <Route path="/categories" element={<CategoryPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
