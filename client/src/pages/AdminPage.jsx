import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  fetchAdminOverview, 
  moderateListing, 
  resolveDispute 
} from "../services/api";
import { 
  ShieldCheck, 
  Users, 
  Shirt, 
  ArrowLeftRight, 
  AlertTriangle, 
  Droplet, 
  Leaf, 
  Trash2, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";

export function AdminPage({ setActivePage, setSelectedItemId }) {
  const { currentUser, switchUser, allUsers } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'listings' | 'disputes' | 'users'
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminOverview();
      setData(res);
    } catch (err) {
      console.error("Admin data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleModerate = async (itemId, action) => {
    try {
      await moderateListing(itemId, action);
      setActionMsg(`Listing ${action === "remove" ? "taken down" : "restored"}.`);
      await loadData();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      alert("Moderation error: " + err.message);
    }
  };

  const handleResolveDispute = async (disputeId) => {
    const notes = prompt("Enter administrative resolution notes for this dispute:");
    if (!notes) return;
    try {
      await resolveDispute(disputeId, notes);
      setActionMsg("Dispute marked resolved.");
      await loadData();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      alert("Resolution error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper">
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: "6px" }}>
              <ShieldCheck size={14} /> Operations & Moderation
            </span>
            <h1 style={{ fontSize: "2.3rem", fontWeight: 800 }}>Admin Management Panel</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Monitor exchange metrics, moderate listings for quality, and resolve member disputes.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-outline btn-sm" onClick={loadData}>
              <RefreshCw size={14} /> Refresh Data
            </button>
            {currentUser?.role !== "admin" && (
              <button 
                className="btn-secondary btn-sm"
                onClick={() => {
                  const adminUser = allUsers.find(u => u.role === "admin");
                  if (adminUser) switchUser(adminUser);
                }}
              >
                Switch to Admin Profile
              </button>
            )}
          </div>
        </div>

        {actionMsg && (
          <div style={{ background: "rgba(46, 213, 115, 0.15)", border: "1px solid #2ed573", padding: "12px 18px", borderRadius: "var(--radius-md)", color: "#2ed573", marginBottom: "20px" }}>
            {actionMsg}
          </div>
        )}

        {/* Admin KPI Overview Cards */}
        {data?.kpis && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px", marginBottom: "36px" }}>
            <div className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Wardrobe Items</span>
                <Shirt size={18} color="var(--palette-yellow)" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{data.kpis.totalListings}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--palette-yellow)", marginTop: "4px" }}>
                {data.kpis.availableListings} currently active
              </div>
            </div>

            <div className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Registered Swappers</span>
                <Users size={18} color="var(--palette-pink-light)" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{data.kpis.activeUsers}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--palette-pink-light)", marginTop: "4px" }}>
                100% verified emails
              </div>
            </div>

            <div className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Completed Swaps</span>
                <ArrowLeftRight size={18} color="var(--palette-pink-neon)" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{data.kpis.successfulSwaps}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--palette-pink-neon)", marginTop: "4px" }}>
                {data.kpis.totalSwaps} proposals created
              </div>
            </div>

            <div className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Open Disputes</span>
                <AlertTriangle size={18} color="#ff8b8b" />
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: data.kpis.openDisputes > 0 ? "#ff8b8b" : "var(--text-main)" }}>
                {data.kpis.openDisputes}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Mediation queue
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <button
            className={`btn-outline ${activeTab === "overview" ? "active" : ""}`}
            style={{
              borderColor: activeTab === "overview" ? "var(--palette-pink-neon)" : "var(--border-subtle)",
              background: activeTab === "overview" ? "rgba(255, 97, 248, 0.12)" : "transparent"
            }}
            onClick={() => setActiveTab("overview")}
          >
            Moderate Listings ({data?.items?.length || 0})
          </button>

          <button
            className={`btn-outline ${activeTab === "disputes" ? "active" : ""}`}
            style={{
              borderColor: activeTab === "disputes" ? "var(--palette-yellow)" : "var(--border-subtle)",
              background: activeTab === "disputes" ? "rgba(255, 234, 108, 0.12)" : "transparent"
            }}
            onClick={() => setActiveTab("disputes")}
          >
            Dispute Resolution ({data?.disputes?.length || 0})
          </button>

          <button
            className={`btn-outline ${activeTab === "users" ? "active" : ""}`}
            style={{
              borderColor: activeTab === "users" ? "var(--palette-pink-light)" : "var(--border-subtle)",
              background: activeTab === "users" ? "rgba(255, 166, 251, 0.12)" : "transparent"
            }}
            onClick={() => setActiveTab("users")}
          >
            User Directory ({data?.users?.length || 0})
          </button>
        </div>

        {/* Tab 1: Moderation */}
        {activeTab === "overview" && (
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Wardrobe Catalog Moderation</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data?.items?.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--border-subtle)",
                    gap: "14px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <img src={it.images[0]} alt={it.title} style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{it.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Brand: <strong>{it.brand}</strong> &bull; Value: <strong>${it.estimatedValue}</strong> &bull; Owner: {it.ownerName}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span className={`badge ${it.status === "available" ? "badge-green" : it.status === "removed_by_admin" ? "badge-pink" : "badge-yellow"}`}>
                      {it.status}
                    </span>

                    {it.status === "removed_by_admin" ? (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleModerate(it.id, "restore")}
                      >
                        Restore Listing
                      </button>
                    ) : (
                      <button
                        className="btn-outline btn-sm"
                        style={{ color: "#ff8b8b", borderColor: "rgba(255, 75, 75, 0.4)" }}
                        onClick={() => handleModerate(it.id, "remove")}
                      >
                        <Trash2 size={14} /> Remove / Flag
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Disputes */}
        {activeTab === "disputes" && (
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Dispute Resolution Queue</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data?.disputes?.map((disp) => (
                <div
                  key={disp.id}
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span className="badge badge-pink">{disp.status}</span>
                      <span style={{ fontWeight: 800 }}>Reported by {disp.reporterName}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginBottom: "4px" }}>
                      Issue: {disp.reason}
                    </div>
                    {disp.resolutionNotes && (
                      <div style={{ fontSize: "0.78rem", color: "var(--palette-yellow)" }}>
                        Resolution: {disp.resolutionNotes}
                      </div>
                    )}
                  </div>

                  {disp.status !== "resolved" && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleResolveDispute(disp.id)}
                    >
                      <CheckCircle2 size={16} /> Resolve Dispute
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === "users" && (
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Community Members Directory</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {data?.users?.map((u) => (
                <div
                  key={u.id}
                  style={{
                    padding: "14px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <img src={u.avatar} alt={u.name} style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{u.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.location}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--palette-pink-light)", marginTop: "2px" }}>
                      {u.sustainabilityScore?.itemsSwapped || 0} swaps finalized
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
