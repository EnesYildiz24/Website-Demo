// src/pages/OrdersPage.tsx
import React, { useEffect, useState } from "react";
import { getOrders } from "../services/api"; 
import LoadingIndicator from "../components/LoadingIndicator";

interface OrderItem {
  product: {
    titel: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: string; // Wird von deinem Service als String geliefert
  buyerId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  orderDate: string;
  paymentInfo: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error("Fehler beim Laden der Bestellungen:", err);
        setError("Bestellungen konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container my-4">
      <h2 className="mb-4">Bestellübersicht</h2>
      {orders.length === 0 ? (
        <div className="alert alert-info">Keine Bestellungen gefunden.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Bestellnummer</th>
                <th>Bestelldatum</th>
                <th>Status</th>
                <th>Anzahl Produkte</th>
                <th>Gesamtpreis</th>
                <th>Zahlungsinfo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                // Verwende order.id als unique key (sollte eindeutig sein)
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "pending"
                          ? "bg-warning"
                          : order.status === "completed"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td>{order.total.toFixed(2)} €</td>
                  <td>{order.paymentInfo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
