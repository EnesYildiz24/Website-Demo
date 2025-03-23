import React, { useEffect, useState } from "react";
import { fetchAllUsers, createUser, deleteUserById } from "../services/api";
import { useAuth } from "../context/AuthContext";

/** Optionales Interface für deine User-Daten (abgeleitet von UserResource) */
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "seller" | "buyer" | "admin"; 
}

export default function AdminUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formular-States zum Erstellen eines neuen Users
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"buyer" | "seller" >("buyer");

  // 1) Beim Laden der Komponente: alle User vom Server holen
  useEffect(() => {
    if (!user || user.role !== "admin") {
      // Nur Admin kann hier sinnvoll zugreifen. 
      return;
    }
    setLoading(true);
    fetchAllUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Fehler beim Laden der Benutzerliste");
        setLoading(false);
      });
  }, [user]);

  // 2) User löschen
  async function handleDeleteUser(userId: string) {
    try {
      // Ruf DELETE /user/:id auf:
      await deleteUserById(userId);
      // Aus dem lokalen State entfernen
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError("Fehler beim Löschen eines Benutzers");
      console.error(err);
    }
  }

  // 3) Neuen User erstellen
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // Das createUser hast du schon definiert:
      const created = await createUser({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      // Neuer User erfolgreich erstellt -> in Liste einfügen
      setUsers((prev) => [...prev, created]);

      // Formular leeren
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("buyer");
    } catch (err) {
      setError("Fehler beim Erstellen eines neuen Users");
      console.error(err);
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container">
        <h2>Kein Zugriff!</h2>
        <p>Nur Admins dürfen diese Seite sehen.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Admin: Benutzer verwalten</h2>

      {loading && <p>Lädt Benutzer...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Benutzer-Liste */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Benutzername</th>
            <th>Email</th>
            <th>Rolle</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteUser(u.id)}
                >
                  Löschen
                </button>
                {/* Evtl. später ein Button zum Bearbeiten: */}
                {/* <button className="btn btn-sm btn-secondary ms-2">Bearbeiten</button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formular zum Anlegen eines neuen Users */}
      <hr />
      <h4>Neuen Benutzer anlegen</h4>
      <form onSubmit={handleCreateUser} style={{ maxWidth: "400px" }}>
        <div className="mb-3">
          <label className="form-label">Benutzername</label>
          <input
            type="text"
            className="form-control"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">E-Mail</label>
          <input
            type="email"
            className="form-control"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Passwort</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Rolle</label>
          <select
            className="form-select"
            value={newRole}
            onChange={(e) =>
              setNewRole(e.target.value as "buyer" | "seller" )
            }
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Erstellen
        </button>
      </form>
    </div>
  );
}
