import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Watch, Order, OrderStatus, AdminStats } from "../types";
import { apiUrl } from "../config";
import { fetchWithAuth, getAccessToken } from "../utils/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WatchPage {
  watches: Watch[];
  total: number;
  page: number;
  pages: number;
}

type AdminTab = "dashboard" | "orders" | "inventory" | "new-product";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#d97706",
  processing: "#2563eb",
  shipped: "#7c3aed",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const jost = "'Jost', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const gold = "var(--brand-gold)";
const anthracite = "var(--brand-anthracite)";
const border = "var(--border-luxury)";

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border,
  padding: "24px 28px",
};

const labelStyle: React.CSSProperties = {
  fontFamily: jost,
  fontSize: "0.68rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#aaa",
  display: "block",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border,
  padding: "8px 12px",
  fontFamily: jost,
  fontSize: "0.85rem",
  color: anthracite,
  background: "#fafaf8",
  outline: "none",
};

// ─── Main component ───────────────────────────────────────────────────────────

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchPage, setWatchPage] = useState<WatchPage>({ watches: [], total: 0, page: 1, pages: 1 });
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(true);

  // Inventory filters
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  // ── Data loaders ─────────────────────────────────────────────────────────

  const loadDashboard = useCallback(async () => {
    const [statsRes, ordersRes] = await Promise.all([
      fetchWithAuth(apiUrl("/api/v1/admin/stats"), { headers: { "Content-Type": "application/json" } }),
      fetchWithAuth(apiUrl("/api/v1/admin/orders"), { headers: { "Content-Type": "application/json" } }),
    ]);
    if (statsRes.status === 403) { toast.error("Kein Admin-Zugriff."); navigate("/"); return; }
    if (!statsRes.ok || !ordersRes.ok) throw new Error("Daten konnten nicht geladen werden.");
    const [statsData, ordersData] = await Promise.all([statsRes.json(), ordersRes.json()]);
    setStats(statsData as AdminStats);
    setOrders(Array.isArray(ordersData) ? (ordersData as Order[]) : []);
  }, [navigate]);

  const loadInventory = useCallback(async (p: number, q: string, b: string) => {
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (q) params.set("search", q);
    if (b) params.set("brand", b);
    const res = await fetchWithAuth(apiUrl(`/api/v1/admin/watches?${params}`), {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Inventar konnte nicht geladen werden.");
    setWatchPage(await res.json() as WatchPage);
  }, []);

  useEffect(() => {
    if (!getAccessToken()) { navigate("/login"); return; }
    setLoading(true);
    loadDashboard()
      .then(() => loadInventory(1, "", ""))
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false));
  }, [loadDashboard, loadInventory, navigate]);

  // Inventory search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadInventory(1, search, brandFilter).catch(() => null);
    }, 350);
    return () => clearTimeout(t);
  }, [search, brandFilter, loadInventory]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetchWithAuth(apiUrl(`/api/v1/admin/orders/${orderId}/status`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Status konnte nicht aktualisiert werden."); return; }
    setOrders((prev) => prev.map((o) => (o.order_id === orderId ? { ...o, status } : o)));
    toast.success("Bestellstatus aktualisiert.");
  };

  const updateWatch = async (watchId: string, patch: Partial<Watch>) => {
    const res = await fetchWithAuth(apiUrl(`/api/v1/admin/watches/${watchId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) { toast.error("Produkt konnte nicht aktualisiert werden."); return; }
    const updated = await res.json() as Watch;
    setWatchPage((prev) => ({
      ...prev,
      watches: prev.watches.map((w) => (w.watch_id === watchId ? updated : w)),
    }));
    toast.success("Produkt aktualisiert.");
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    loadInventory(p, search, brandFilter).catch(() => null);
  };

  // ── Sidebar nav item ───────────────────────────────────────────────────────

  const NavItem = ({ id, label }: { id: AdminTab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: tab === id ? "#faf7f2" : "none",
        border: "none",
        borderLeft: `3px solid ${tab === id ? gold : "transparent"}`,
        padding: "10px 20px",
        fontFamily: jost,
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: tab === id ? gold : "#666",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 160, background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #e0e0e0", borderTopColor: gold, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--brand-light)", minHeight: "100vh", paddingTop: 136 }}>
      <div className="container-fluid px-0" style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div className="row g-0">

          {/* ── Sidebar ── */}
          <div
            className="col-12 col-md-2 d-none d-md-block"
            style={{ background: "#fff", borderRight: border, minHeight: "calc(100vh - 136px)", paddingTop: 32 }}
          >
            <p style={{ fontFamily: jost, fontSize: "0.62rem", letterSpacing: "0.18em", color: "#ccc", padding: "0 20px 12px", textTransform: "uppercase" }}>
              Administration
            </p>
            <NavItem id="dashboard" label="Dashboard" />
            <NavItem id="orders" label="Bestellungen" />
            <NavItem id="inventory" label="Inventar" />
            <NavItem id="new-product" label="Neues Produkt" />
          </div>

          {/* ── Mobile tab bar ── */}
          <div className="col-12 d-md-none" style={{ background: "#fff", borderBottom: border }}>
            <div className="d-flex overflow-auto" style={{ gap: 0 }}>
              {(["dashboard", "orders", "inventory", "new-product"] as AdminTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: "0 0 auto",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${tab === t ? gold : "transparent"}`,
                    fontFamily: jost,
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: tab === t ? gold : "#999",
                    cursor: "pointer",
                  }}
                >
                  {t === "new-product" ? "Neu" : t}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="col-12 col-md-10" style={{ padding: "32px 28px" }}>

            {/* Page title */}
            <h1
              style={{ fontFamily: serif, fontSize: "1.8rem", fontWeight: 400, color: anthracite, marginBottom: 28 }}
            >
              {tab === "dashboard" && "Dashboard"}
              {tab === "orders" && "Bestellungen"}
              {tab === "inventory" && "Inventar"}
              {tab === "new-product" && "Neues Produkt"}
            </h1>

            {/* ─────────── DASHBOARD ─────────── */}
            {tab === "dashboard" && stats && (
              <>
                <div className="row g-3 mb-4">
                  {[
                    { label: "Bestellungen", value: stats.orders.total, sub: `${stats.orders.pending} ausstehend`, color: "#d97706" },
                    { label: "Umsatz", value: `€${parseFloat(stats.revenue.total).toFixed(0)}`, sub: "Gesamt (nicht storniert)", color: "#16a34a" },
                    { label: "Kunden", value: stats.customers.total, sub: "Registriert", color: "#2563eb" },
                    { label: "Produkte", value: stats.watches.total, sub: `${stats.watches.low_stock} niedriger Bestand`, color: parseInt(stats.watches.low_stock) > 0 ? "#dc2626" : "#888" },
                  ].map((card) => (
                    <div key={card.label} className="col-6 col-lg-3">
                      <div style={cardStyle}>
                        <p style={{ ...labelStyle, marginBottom: 8 }}>{card.label}</p>
                        <p style={{ fontFamily: serif, fontSize: "2rem", fontWeight: 400, color: anthracite, margin: 0 }}>
                          {card.value}
                        </p>
                        <p style={{ fontFamily: jost, fontSize: "0.72rem", color: card.color, margin: "4px 0 0" }}>
                          {card.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent orders summary */}
                <div style={cardStyle}>
                  <p style={{ ...labelStyle, marginBottom: 16 }}>Letzte Bestellungen</p>
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.order_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0ede8", fontFamily: jost, fontSize: "0.82rem" }}>
                      <span style={{ color: "#aaa" }}>#{o.order_id}</span>
                      <span style={{ color: anthracite }}>{o.full_name || "Gast"}</span>
                      <span style={{ fontWeight: 500 }}>€{parseFloat(o.total_amount).toFixed(2)}</span>
                      <span style={{ background: STATUS_COLORS[o.status] + "22", color: STATUS_COLORS[o.status], padding: "2px 10px", fontSize: "0.68rem", letterSpacing: "0.1em" }}>
                        {o.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {orders.length === 0 && <p style={{ color: "#ccc", fontFamily: jost, fontSize: "0.82rem" }}>Keine Bestellungen.</p>}
                </div>
              </>
            )}

            {/* ─────────── ORDERS ─────────── */}
            {tab === "orders" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: jost, fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e8e4de" }}>
                      {["#", "Kunde", "Artikel", "Gesamt", "Datum", "Status"].map((h) => (
                        <th key={h} style={{ ...labelStyle, padding: "0 12px 10px 0", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.order_id} style={{ borderBottom: "1px solid #f0ede8" }}>
                        <td style={{ padding: "12px 12px 12px 0", color: "#aaa" }}>#{order.order_id}</td>
                        <td style={{ padding: "12px 12px 12px 0" }}>
                          <div style={{ color: anthracite, fontWeight: 500 }}>{order.full_name || "Gast"}</div>
                          <div style={{ color: "#aaa", fontSize: "0.72rem" }}>{order.email}</div>
                        </td>
                        <td style={{ padding: "12px 12px 12px 0", maxWidth: 220 }}>
                          {order.items?.filter(Boolean).slice(0, 2).map((item, i) => (
                            <div key={i} style={{ color: "#666", fontSize: "0.75rem" }}>
                              {item.watch_name} ×{item.quantity}
                            </div>
                          ))}
                          {(order.items?.length ?? 0) > 2 && (
                            <div style={{ color: "#aaa", fontSize: "0.72rem" }}>+{(order.items?.length ?? 0) - 2} weitere</div>
                          )}
                        </td>
                        <td style={{ padding: "12px 12px 12px 0", fontWeight: 500 }}>€{parseFloat(order.total_amount).toFixed(2)}</td>
                        <td style={{ padding: "12px 12px 12px 0", color: "#aaa", whiteSpace: "nowrap" }}>
                          {new Date(order.order_date).toLocaleDateString("de-DE")}
                        </td>
                        <td style={{ padding: "12px 0" }}>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.order_id, e.target.value as OrderStatus)}
                            style={{
                              border,
                              background: STATUS_COLORS[order.status] + "15",
                              color: STATUS_COLORS[order.status],
                              fontFamily: jost,
                              fontSize: "0.72rem",
                              letterSpacing: "0.08em",
                              padding: "4px 8px",
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <p style={{ fontFamily: jost, fontSize: "0.82rem", color: "#ccc", marginTop: 24 }}>Keine Bestellungen vorhanden.</p>
                )}
              </div>
            )}

            {/* ─────────── INVENTORY ─────────── */}
            {tab === "inventory" && (
              <>
                {/* Filters */}
                <div className="d-flex flex-wrap gap-2 mb-4" style={{ alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={labelStyle}>Suche</label>
                    <input
                      type="text"
                      placeholder="Name, Marke, Referenz..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: "0 0 160px" }}>
                    <label style={labelStyle}>Marke</label>
                    <input
                      type="text"
                      placeholder="z.B. Seiko"
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ fontFamily: jost, fontSize: "0.72rem", color: "#aaa", paddingBottom: 10 }}>
                    {watchPage.total.toLocaleString("de-DE")} Produkte · Seite {watchPage.page}/{watchPage.pages}
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: jost, fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e8e4de" }}>
                        {["Produkt", "Referenz", "Preis (€)", "Bild-URL", "Beschreibung", "Bestand", ""].map((h) => (
                          <th key={h} style={{ ...labelStyle, padding: "0 10px 10px 0", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {watchPage.watches.map((w) => (
                        <WatchEditRow key={w.watch_id} watch={w} onSave={updateWatch} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {watchPage.pages > 1 && (
                  <div className="d-flex gap-2 mt-4 flex-wrap" style={{ alignItems: "center" }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                      style={{ ...paginationBtn, opacity: page <= 1 ? 0.35 : 1 }}
                    >
                      ← Zurück
                    </button>
                    {Array.from({ length: Math.min(watchPage.pages, 7) }, (_, i) => {
                      const p = watchPage.pages <= 7 ? i + 1 : Math.max(1, page - 3) + i;
                      if (p > watchPage.pages) return null;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          style={{ ...paginationBtn, background: p === page ? anthracite : "#fff", color: p === page ? "#fff" : "#888" }}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      disabled={page >= watchPage.pages}
                      onClick={() => handlePageChange(page + 1)}
                      style={{ ...paginationBtn, opacity: page >= watchPage.pages ? 0.35 : 1 }}
                    >
                      Weiter →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ─────────── NEW PRODUCT ─────────── */}
            {tab === "new-product" && (
              <NewProductForm
                onCreated={() => {
                  toast.success("Produkt erstellt.");
                  setTab("inventory");
                  loadInventory(1, "", "").catch(() => null);
                }}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination button style ───────────────────────────────────────────────────

const paginationBtn: React.CSSProperties = {
  background: "#fff",
  border,
  padding: "6px 14px",
  fontFamily: jost,
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  color: "#888",
  cursor: "pointer",
};

// ─── WatchEditRow ─────────────────────────────────────────────────────────────

interface WatchEditRowProps {
  watch: Watch;
  onSave: (id: string, patch: Partial<Watch>) => Promise<void>;
}

function WatchEditRow({ watch, onSave }: WatchEditRowProps) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(watch.price));
  const [stock, setStock] = useState(String(watch.stock_quantity ?? 0));
  const [imageUrl, setImageUrl] = useState(watch.image_url || "");
  const [description, setDescription] = useState(watch.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave(watch.watch_id, {
      price: price as unknown as string,
      stock_quantity: parseInt(stock, 10) || 0,
      image_url: imageUrl || undefined,
      description: description || undefined,
    });
    setSaving(false);
    setEditing(false);
  };

  const cell: React.CSSProperties = { padding: "10px 10px 10px 0", verticalAlign: "middle" };
  const miniInput: React.CSSProperties = {
    border,
    padding: "5px 8px",
    fontFamily: jost,
    fontSize: "0.78rem",
    color: anthracite,
    background: "#fafaf8",
    outline: "none",
  };

  return (
    <tr style={{ borderBottom: "1px solid #f0ede8" }}>
      <td style={cell}>
        <div style={{ fontWeight: 500, color: anthracite, fontSize: "0.82rem" }}>{watch.watch_name}</div>
        <div style={{ color: gold, fontSize: "0.68rem", letterSpacing: "0.1em" }}>{watch.brand}</div>
      </td>
      <td style={{ ...cell, color: "#aaa", fontSize: "0.75rem" }}>{watch.model_code || "—"}</td>
      <td style={cell}>
        {editing
          ? <input value={price} onChange={(e) => setPrice(e.target.value)} style={{ ...miniInput, width: 80 }} />
          : <span style={{ color: anthracite }}>€{parseFloat(watch.price).toFixed(2)}</span>
        }
      </td>
      <td style={cell}>
        {editing
          ? <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." style={{ ...miniInput, width: 200 }} />
          : <span style={{ color: watch.image_url ? "#16a34a" : "#dc2626", fontSize: "0.72rem" }}>
              {watch.image_url ? "✓ gesetzt" : "✗ fehlt"}
            </span>
        }
      </td>
      <td style={cell}>
        {editing
          ? <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...miniInput, width: 200, resize: "vertical" }} />
          : <span style={{ color: watch.description ? "#16a34a" : "#dc2626", fontSize: "0.72rem" }}>
              {watch.description ? "✓ gesetzt" : "✗ fehlt"}
            </span>
        }
      </td>
      <td style={cell}>
        {editing
          ? <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={{ ...miniInput, width: 70 }} min={0} />
          : <span style={{
              background: (watch.stock_quantity ?? 0) > 0 ? "#16a34a22" : "#dc262622",
              color: (watch.stock_quantity ?? 0) > 0 ? "#16a34a" : "#dc2626",
              padding: "2px 8px",
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
            }}>
              {watch.stock_quantity ?? 0}
            </span>
        }
      </td>
      <td style={{ ...cell, whiteSpace: "nowrap" }}>
        {editing ? (
          <div className="d-flex gap-1">
            <button
              onClick={save}
              disabled={saving}
              style={{ background: anthracite, color: "#fff", border: "none", padding: "5px 14px", fontFamily: jost, fontSize: "0.68rem", letterSpacing: "0.1em", cursor: "pointer" }}
            >
              {saving ? "..." : "SAVE"}
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ background: "none", border, padding: "5px 10px", fontFamily: jost, fontSize: "0.68rem", color: "#aaa", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{ background: "none", border, padding: "5px 14px", fontFamily: jost, fontSize: "0.68rem", letterSpacing: "0.1em", color: "#888", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0ddd8"; e.currentTarget.style.color = "#888"; }}
          >
            EDIT
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── NewProductForm ───────────────────────────────────────────────────────────

function NewProductForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ brand: "", watch_name: "", model_code: "", price: "", stock_quantity: "0", image_url: "", description: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.brand || !form.watch_name || !form.price) { toast.error("Marke, Name und Preis sind Pflichtfelder."); return; }
    setSaving(true);
    try {
      const res = await fetchWithAuth(apiUrl("/api/v1/admin/watches"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity, 10) || 0 }),
      });
      if (!res.ok) { const err = await res.json() as { error: string }; toast.error(err.error || "Fehler beim Erstellen."); return; }
      onCreated();
      setForm({ brand: "", watch_name: "", model_code: "", price: "", stock_quantity: "0", image_url: "", description: "" });
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ k, label, placeholder, type = "text" }: { k: string; label: string; placeholder?: string; type?: string }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={(form as Record<string, string>)[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  );

  return (
    <div style={{ ...cardStyle, maxWidth: 600 }}>
      <Field k="brand" label="Marke *" placeholder="z.B. Seiko" />
      <Field k="watch_name" label="Produktname *" placeholder="z.B. Seiko Presage SPB167" />
      <Field k="model_code" label="Referenznummer" placeholder="z.B. SPB167J1" />
      <div className="row g-3">
        <div className="col-6"><Field k="price" label="Preis (€) *" placeholder="349.00" type="number" /></div>
        <div className="col-6"><Field k="stock_quantity" label="Lagerbestand" placeholder="0" type="number" /></div>
      </div>
      <Field k="image_url" label="Bild-URL" placeholder="https://images.unsplash.com/..." />
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Beschreibung</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Kurze Produktbeschreibung..." style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <button
        onClick={submit}
        disabled={saving}
        style={{ background: anthracite, color: "#fff", border: "none", padding: "12px 32px", fontFamily: jost, fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", transition: "background 0.15s" }}
        onMouseEnter={(e) => !saving && (e.currentTarget.style.background = gold)}
        onMouseLeave={(e) => (e.currentTarget.style.background = anthracite)}
      >
        {saving ? "WIRD ERSTELLT..." : "PRODUKT ERSTELLEN"}
      </button>
    </div>
  );
}

export default AdminPanel;
