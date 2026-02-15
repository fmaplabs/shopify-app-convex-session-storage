import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function SessionManager() {
  const [shop, setShop] = useState("test-shop.myshopify.com");
  const sessions = useQuery(api.example.findSessionsByShop, { shop });
  const storeSession = useMutation(api.example.storeSession);
  const deleteSession = useMutation(api.example.deleteSession);
  const deleteByShop = useMutation(api.example.deleteSessionsByShop);

  const handleCreateOffline = () => {
    void storeSession({
      id: `offline_${shop}`,
      shop,
      isOnline: false,
      scope: "read_products,write_orders",
      accessToken: `shpat_${Date.now()}`,
    });
  };

  const handleCreateOnline = () => {
    void storeSession({
      id: `online_${shop}_${Date.now()}`,
      shop,
      isOnline: true,
      scope: "read_products",
      accessToken: `shpat_online_${Date.now()}`,
    });
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "left" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          Shop domain:{" "}
          <input
            type="text"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            style={{ padding: "0.5rem", width: "300px" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button onClick={handleCreateOffline}>Create Offline Session</button>
        <button onClick={handleCreateOnline}>Create Online Session</button>
        <button
          onClick={() => void deleteByShop({ shop })}
          style={{ backgroundColor: "#dc3545", color: "white", border: "none" }}
        >
          Delete All for Shop
        </button>
      </div>

      <h3>Sessions for {shop} ({sessions?.length ?? 0})</h3>
      {sessions?.length === 0 && (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          No sessions. Create one above.
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sessions?.map((session) => (
          <li
            key={session._id}
            style={{
              padding: "0.75rem",
              marginBottom: "0.5rem",
              border: "1px solid rgba(128,128,128,0.3)",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{session.id}</strong>
              <br />
              <small>
                {session.isOnline ? "Online" : "Offline"} | Scope:{" "}
                {session.scope ?? "none"} | Token: {session.accessToken ?? "none"}
              </small>
            </div>
            <button
              onClick={() => void deleteSession({ id: session.id })}
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <>
      <h1>Shopify Session Storage Demo</h1>
      <div className="card">
        <SessionManager />
        <p style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
          See <code>example/convex/example.ts</code> for usage
        </p>
      </div>
    </>
  );
}

export default App;
