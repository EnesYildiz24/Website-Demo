// src/pages/LoginPage.tsx
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

interface Props {
  onLoginSuccess: (role: "admin" | "seller" | "buyer") => void;
}

export default function LoginPage({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const result = await loginUser({ email, password });
      // result = { id, role }
      onLoginSuccess(result.role);
      navigate("/");
    } catch (error) {
      setErrorMsg("Login fehlgeschlagen: " + (error as Error).message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>{" "}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Passwort: </label>{" "}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <button type="submit">Einloggen</button>
      </form>
    </div>
  );
}
