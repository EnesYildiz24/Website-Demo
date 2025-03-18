// src/App.tsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { AuthProvider } from "./context/AuthContext";
import ShoppingCartPage from "./pages/ShoppingCartPage";

function App() {
  const [userRole, setUserRole] = useState<"admin" | "seller" | "buyer" | null>(
    null
  );

  return (
    <AuthProvider>
      <Navbar
        userRole={userRole}
        setUserRole={setUserRole}
        onLoginSuccess={(role) => {
          console.log("Login success, role:", role);
          setUserRole(role);
        }}
      />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/products"
            element={<ProductsPage userRole={userRole} />}
          />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/cart" element={<ShoppingCartPage />} />
          </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
