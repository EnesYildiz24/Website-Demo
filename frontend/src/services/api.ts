// src/services/api.ts
const BASE_URL = "http://localhost:3000";
// Passen: dein Express läuft ggf. auf Port 3000 oder 8080 etc.

interface LoginPayload {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  role: "admin" | "seller" | "buyer";
  // ggf. exp usw.
}

export async function loginUser(payload: LoginPayload): Promise<UserResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    credentials: "include", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Login fehlgeschlagen");
  }
  return response.json(); 
}

export async function logoutUser(): Promise<void> {
  await fetch(`${BASE_URL}/login`, {
    method: "DELETE",
    credentials: "include",
  });
}

// Beispiel: Alle Produkte abrufen
export async function fetchProducts() {
  const response = await fetch(`${BASE_URL}/product`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Produkte konnten nicht geladen werden");
  }
  return response.json(); // Array von Produkt-Objekten
}

// Beispiel: Neues Produkt erstellen
interface ProductPayload {
  titel: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}
export async function createProduct(product: ProductPayload) {
  const response = await fetch(`${BASE_URL}/product`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error("Produkt konnte nicht erstellt werden");
  }
  return response.json();
}

// Beispiel: Produkt löschen
export async function deleteProduct(productId: string) {
  const response = await fetch(`${BASE_URL}/product/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Produkt konnte nicht gelöscht werden");
  }
}

export async function fetchCategories() {
  const response = await fetch(`${BASE_URL}/categories`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Kategorien konnten nicht geladen werden");
  }
  return response.json();
}