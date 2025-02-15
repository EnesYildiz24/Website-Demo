/**
 * UserResource
 * 
 * Dient zur Darstellung von User-Daten, die an den Client übermittelt werden.
 * - id: Optional, da bei der Erstellung noch nicht vorhanden. Später aber immer vorhanden.
 * - username: Der Benutzername.
 * - email: Optional – beim Schreiben enthalten, beim Lesen ggf. eingeschränkt.
 * - password: Write-only, d.h. beim Lesen niemals enthalten.
 * - role: "a" = admin, "s" = seller, "b" = buyer.
 */
export type UserResource = {
    id?: string;
    username: string;
    email?: string;
    password?: string;
    role: string;
  };
  
  /**
   * ProductResource
   * 
   * Dient zur Darstellung eines Produkts (z. B. eines Spiels) in der API.
   * - id: Optional, da bei der Erstellung noch nicht vorhanden.
   * - titel: Der Titel des Produkts.
   * - description: Eine Beschreibung des Produkts.
   * - price: Der Preis.
   * - images: Ein Array von Bild-URLs.
   * - category: Die zugehörige Kategorie.
   * - createdAt / updatedAt: Werden automatisch von MongoDB gesetzt und sind beim Lesen vorhanden.
   */
  export type ProductResource = {
    id?: string;
    titel: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    createdAt?: string;
    updatedAt?: string;
  };
  
  /**
   * OrderResource
   * 
   * Modelliert den Kaufvorgang eines Produkts.
   * - id: Optional, da bei der Erstellung noch nicht vorhanden.
   * - buyerId: Die ID des Käufers (User).
   * - productId: Die ID des gekauften Produkts.
   * - orderDate: Das Datum des Bestellvorgangs.
   * - status: Der Bestellstatus ("pending", "completed", "cancelled").
   * - paymentInfo: Zahlungsinformationen.
   */
  export type OrderResource = {
    id?: string;
    buyerId: string;
    productId: string;
    orderDate: string;
    status: string;
    paymentInfo: string;
  };
  
  /**
   * ReviewResource
   * 
   * Ermöglicht es, Bewertungen zu Produkten oder Verkäufern darzustellen.
   * - id: Optional, da bei der Erstellung noch nicht vorhanden.
   * - reviewerId: Die ID des Rezensenten (User).
   * - productId: Optional, falls die Bewertung für ein Produkt gilt.
   * - sellerId: Optional, falls die Bewertung für einen Verkäufer gilt.
   * - rating: Die Bewertung (z. B. 1-5 Sterne).
   * - comment: Der Bewertungstext.
   * - createdAt: Wird von MongoDB automatisch gesetzt.
   */
  export type ReviewResource = {
    id?: string;
    reviewerId: string;
    productId?: string;
    sellerId?: string;
    rating: number;
    comment: string;
    createdAt?: string;
  };
  
  /**
   * CategoryResource
   * 
   * Dient zur Strukturierung von Produkten (z. B. als Genre oder Kategorie).
   * - id: Optional, da bei der Erstellung noch nicht vorhanden.
   * - name: Der Name der Kategorie.
   * - description: Eine Beschreibung der Kategorie.
   */
  export type CategoryResource = {
    id?: string;
    name: string;
    description: string;
  };
  
  /**
   * LoginResource
   * 
   * Wird beim Login zurückgegeben und enthält:
   * - id: Die ID des authentifizierten Users.
   * - role: Die Rolle des Users ("a" = admin, "s" = seller, "b" = buyer).
   * - exp: Das Ablaufdatum (Expiration) als Sekunden seit dem 1.1.1970.
   */
  export type LoginResource = {
    id: string;
    role: "a" | "s" | "b";
    exp: number;
  };
  