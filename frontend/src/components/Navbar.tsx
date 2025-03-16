import React, { useState, FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { logoutUser, loginUser, createUser, getLogin } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onLoginSuccess: (role: "admin" | "seller" | "buyer") => void;
  userRole: "admin" | "seller" | "buyer" | null;
  setUserRole: React.Dispatch<
    React.SetStateAction<"admin" | "seller" | "buyer" | null>
  >;
}
export default function Navbar({
  onLoginSuccess,
  userRole,
  setUserRole,
}: NavbarProps) {
  // Login-State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { setUser } = useAuth();

  // Register-State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"seller" | "buyer">("buyer");
  const [registerErrorMsg, setRegisterErrorMsg] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const loginStatus = await getLogin();
      if (loginStatus) {
        setUserRole(loginStatus.role);
        setUser({
          username: loginStatus.username || "",
          role: loginStatus.role,
          id: loginStatus.id,
        });
      } else {
        setUserRole(null);
      }
    })();
  }, [setUser]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const result = await loginUser({ email, password });
      setUser({
        id: result.id,
        username: result.username || "",
        role: result.role,
      });
      onLoginSuccess(result.role);
      setUserRole(result.role);
      setShowLoginModal(false);
      // Felder zurücksetzen
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMsg("Login fehlgeschlagen: " + (error as Error).message);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegisterErrorMsg(null);
    try {
      const result = await createUser({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
      });
      setUser({
        username: registerUsername,
        role: result.role,
        id: result.id,
      });
      onLoginSuccess(result.role);
      setUserRole(result.role);
      setShowRegisterModal(false);
      setRegisterUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error) {
      setRegisterErrorMsg(
        "Registrierung fehlgeschlagen: " + (error as Error).message
      );
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      setUserRole(null);
      setUser(null);
    } catch (error) {
      console.error("Logout fehlgeschlagen", error);
    }
  }

  return (
    <header>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
      />
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Marketplace
          </Link>
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
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  Produkte
                </Link>
              </li>
            </ul>
            <div className="d-flex">
              {/* User Icon Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-link dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i
                    className="bi bi-person-circle"
                    style={{ fontSize: "1.5rem", color: "black" }}
                  ></i>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userDropdown"
                >
                  {userRole ? (
                    <>
                      <li>
                        <span className="dropdown-item-text">
                          Angemeldet als {userRole.toUpperCase()}
                        </span>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setShowLoginModal(true)}
                        >
                          Login
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setShowRegisterModal(true)}
                        >
                          Registrieren
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal-Login */}
      {showLoginModal && (
        <>
          <div
            className="modal show fade"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Login</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLoginModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {errorMsg && <p className="text-danger">{errorMsg}</p>}
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="loginEmail" className="form-label">
                        Email:
                      </label>
                      <input
                        type="email"
                        id="loginEmail"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="loginPassword" className="form-label">
                        Passwort:
                      </label>
                      <input
                        type="password"
                        id="loginPassword"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Einloggen
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Modal-Register */}
      {showRegisterModal && (
        <>
          <div
            className="modal show fade"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Registrieren</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRegisterModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {registerErrorMsg && (
                    <p className="text-danger">{registerErrorMsg}</p>
                  )}
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label htmlFor="registerUsername" className="form-label">
                        Benutzername:
                      </label>
                      <input
                        type="text"
                        id="registerUsername"
                        className="form-control"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="registerEmail" className="form-label">
                        Email:
                      </label>
                      <input
                        type="email"
                        id="registerEmail"
                        className="form-control"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="registerPassword" className="form-label">
                        Passwort:
                      </label>
                      <input
                        type="password"
                        id="registerPassword"
                        className="form-control"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="registerRole" className="form-label">
                        Rolle:
                      </label>
                      <select
                        id="registerRole"
                        className="form-control"
                        value={registerRole}
                        onChange={(e) =>
                          setRegisterRole(e.target.value as "seller" | "buyer")
                        }
                        required
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Registrieren
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </header>
  );
}
