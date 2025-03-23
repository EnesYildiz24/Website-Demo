import { LoginResource } from "../components/Resources";
import { fetchWithErrorHandling } from "./fetchWithErrorHandling";

// src/services/api.ts
const BASE_URL = "http://localhost:3000";
// Passen: dein Express läuft ggf. auf Port 3000 oder 8080 etc.

interface LoginPayload {
  email: string;
  password: string;
}

interface RegistLoginPayload {
  username: string;
  email: string;
  password: string;
  role: "seller" | "buyer";
}
interface UserResponse {
  id: string;
  role: "admin" | "seller" | "buyer";
  username?: string;
  // ggf. exp usw.
}

export async function loginUser(payload: LoginPayload): Promise<UserResponse> {
  const response = await fetchWithErrorHandling(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Login fehlgeschlagen");
  }
  return response.json();
}

export async function logoutUser(): Promise<void> {
  await fetchWithErrorHandling(`${BASE_URL}/login`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function fetchProducts() {
  const response = await fetchWithErrorHandling(`${BASE_URL}/product`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Produkte konnten nicht geladen werden");
  }
  return response.json();
}

interface ProductPayload {
  titel: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}
export async function createProduct(product: ProductPayload) {
  const response = await fetchWithErrorHandling(`${BASE_URL}/product`, {
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

export async function deleteProduct(productId: string) {
  const response = await fetchWithErrorHandling(
    `${BASE_URL}/product/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Produkt konnte nicht gelöscht werden");
  }
}

export async function createUser(user: RegistLoginPayload) {
  const response = await fetchWithErrorHandling(`${BASE_URL}/user`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fehler beim Erstellen des Nutzers:", errorText);
    throw new Error("Nutzer konnte nicht erstellt werden");
  }
  return response.json();
}
export async function fetchCategories() {
  const response = await fetchWithErrorHandling(`${BASE_URL}/categories`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Kategorien konnten nicht geladen werden");
  }
  return response.json();
}

export async function getLogin(): Promise<LoginResource | null> {
  const url = `${BASE_URL}/login`;
  try {
    const response = await fetchWithErrorHandling(url, {
      credentials: "include",
    });
  
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error(`Fehler beim Abrufen des Login-Status: ${response.statusText}`);
    }
  console.log("getLogin API-Antwort:", await response.clone().json());

    return await response.json();
  } catch (error) {
    console.error("Fehler bei getLogin:", error);
    return null;
  }
}

export async function fetchReviews(productId: string) {
  const response = await fetchWithErrorHandling(
    `${BASE_URL}/reviews/product/${productId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Fehler beim Laden der Bewertungen");
  }

  return response.json();
}

export async function submitReview(
  productId: string,
  rating: number,
  comment: string,
  reviewerName: string
) {
  const response = await fetchWithErrorHandling(`${BASE_URL}/reviews`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      rating,
      comment,
      reviewerName,
    }),
  });

  return response.json();
}

export async function deleteReview(reviewId: string) {
  const token = localStorage.getItem("token"); // Token abrufen

  const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Token mitsenden
    },
  });

  if (response.status === 401) {
    throw new Error("Nicht autorisiert – bitte erneut anmelden.");
  }

  if (!response.ok) {
    throw new Error("Fehler beim Löschen der Bewertung");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export async function getCart() {
  const response = await fetchWithErrorHandling(`${BASE_URL}/cart`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Fehler beim Laden des Warenkorbs");
  }

  return response.json();
}

export async function addToCart(productId: string, quantity: number = 1) {
  const response = await fetchWithErrorHandling(`${BASE_URL}/cart/add`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) {
    throw new Error("Fehler beim Hinzufügen zum Warenkorb");
  }

  return response.json();
}

export async function removeFromCart(productId: string) {
  const response = await fetchWithErrorHandling(
    `${BASE_URL}/cart/remove/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Fehler beim Entfernen aus dem Warenkorb");
  }

  return response.json();
}
export async function clearCart() {
  const response = await fetchWithErrorHandling(`${BASE_URL}/cart/clear`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Fehler beim Leeren des Warenkorbs");
  }

  return response.json();
}

export async function checkout() {
  const response = await fetchWithErrorHandling(`${BASE_URL}/order/checkout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Fehler beim Checkout");
  }
  return response.json();
}

export async function getOrders() {
  const response = await fetchWithErrorHandling(`${BASE_URL}/order`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Fehler beim Laden der Bestellungen");
  }

  return response.json();
}

export async function fetchAllUsers() {
  const response = await fetchWithErrorHandling(`${BASE_URL}/user`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Fehler beim Laden aller User");
  }
  return response.json();
}

export async function deleteUserById(userId: string) {
  const response = await fetchWithErrorHandling(`${BASE_URL}/user/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Fehler beim Löschen eines Users");
  }
  return response;
}