// src/components/Navbar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";

interface Props {
  userRole: "admin" | "seller" | "buyer" | null;
  setUserRole: React.Dispatch<
    React.SetStateAction<"admin" | "seller" | "buyer" | null>
  >;
}

export default function Navbar({ userRole, setUserRole }: Props) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutUser();
      setUserRole(null);
      navigate("/");
    } catch (error) {
      console.error("Logout fehlgeschlagen", error);
    }
  }

  return (
    <nav style={{ marginBottom: "1rem" }}>
      <Link to="/">Home</Link> | <Link to="/products">Produkte</Link>{" "}
      {userRole ? (
        <>
          &nbsp;| Angemeldet als {userRole.toUpperCase()} &nbsp;
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          &nbsp;| <Link to="/login">Login</Link>
        </>
      )}
    </nav>
  );
}
