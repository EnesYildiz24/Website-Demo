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
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Marketplace</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Navigation umschalten"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">Produkte</Link>
              </li>
            </ul>
            <div className="d-flex">
              {userRole ? (
                <>
                  <span className="navbar-text me-3">
                    Angemeldet als {userRole.toUpperCase()}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link className="btn btn-outline-primary" to="/login">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
