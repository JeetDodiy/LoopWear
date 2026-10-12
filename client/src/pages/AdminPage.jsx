import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  fetchAdminOverview, 
  moderateListing, 
  resolveDispute,
  loginUser
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
  RefreshCw,
  Lock,
  Key,
  Eye,
  EyeOff,
  ArrowLeft,
  LogOut,
  Sparkles,
  Shield
} from "lucide-react";

export function AdminPage({ setActivePage, setSelectedItemId }) {
  const { currentUser, switchUser, allUsers, logout } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'listings' | 'disputes' | 'users'
  const [actionMsg, setActionMsg] = useState("");

  // In-page Admin Login state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);

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
    if (currentUser?.role === "admin") {
      loadData();
    }
  }, [currentUser]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await loginUser({
        username: adminUsername.trim(),
        password: adminPassword.trim(),
        requiredRole: "admin"
      });
      switchUser(res.user);
      loadData();
    } catch (err) {
      setAuthError(err.message || "Invalid administrator credentials. Access restricted.");
    } finally {
      setAuthLoading(false);
    }
  };

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

  // If user is NOT an admin, display the dedicated Admin Gateway Login Panel
  if (currentUser?.role !== "admin") {
    return (
      <div style={{ padding: "60px 0 100px 0" }}>
        <div className="content-wrapper" style={{ maxWidth: "540px" }}>
          
          <button
            onClick={() => setActivePage("listings")}
            className="btn-outline btn-sm"
            style={{ marginBottom: "24px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={15} /> Back to User Clothes Exchange
          </button>

          <div 
            className="glass-card" 
            style={{ 
              borderColor: "rgba(255, 234, 108, 0.4)", 
              background: "rgba(18, 20, 29, 0.95)",
              boxShadow: "var(--glow-yellow)"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(255, 234, 108, 0.12)",
                border: "1px solid rgba(255, 234, 108, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <Shield size={28} color="var(--palette-yellow)" />
              </div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                Admin Portal Gate
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                Restricted to LoopWear Operations & Platform Supervisors. Enter administrator credentials to proceed.
              </p>
            </div>

            {authError && (
              <div style={{ 
                background: "rgba(255, 75, 75, 0.12)", 
                border: "1px solid #ff4b4b", 
                padding: "12px 16px", 
                borderRadius: "var(--radius-sm)", 
                color: "#ff8b8b", 
                marginBottom: "20px", 
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Admin Username or Email
                </label>
                <input
                  type="text"
                  placeholder="admin or admin@unswap.org"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {showAdminPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showAdminPass ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showAdminPass ? "text" : "password"}
                  placeholder="Enter administrator password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={authLoading}
                style={{ 
                  justifyContent: "center", 
                  marginTop: "8px", 
                  padding: "13px", 
                  fontSize: "0.95rem",
                  background: "linear-gradient(135deg, var(--palette-yellow), #e09b00)",
                  color: "#12141D"
                }}
              >
                <ShieldCheck size={18} /> {authLoading ? "Verifying Authority..." : "Log In & Enter Admin Panel"}
              </button>
            </form>

            {/* Quick autofill helper */}
            <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                type="button"
                onClick={() => {
                  setAdminUsername("admin");
                  setAdminPassword("admin123");
                }}
                style={{
                  width: "100%",
                  background: "rgba(255, 234, 108, 0.05)",
                  border: "1px solid rgba(255, 234, 108, 0.25)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  color: "var(--text-main)",
                  fontSize: "0.84rem"
                }}
              >
                <div>
                  <strong>Autofill Demo Admin Credentials</strong>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Username: <code style={{ color: "var(--palette-yellow)" }}>admin</code> | Password: <code style={{ color: "var(--palette-pink-light)" }}>admin123</code>
                  </div>
                </div>
                <span className="badge badge-yellow" style={{ fontSize: "0.7rem" }}>
                  Fill &rarr;
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper">
        
        {/* Supervisor Status Banner */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          background: "rgba(255, 234, 108, 0.08)",
          border: "1px solid rgba(255, 234, 108, 0.25)",
          padding: "12px 18px",
          borderRadius: "var(--radius-md)",
          marginBottom: "28px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={20} color="var(--palette-yellow)" />
            <div>
              <span style={{ fontWeight: 800, color: "var(--palette-yellow)", fontSize: "0.9rem" }}>
                Admin Operations Active
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginLeft: "8px" }}>
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.username || currentUser.email})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                const regularUser = allUsers.find(u => u.role !== "admin") || allUsers[0];
                if (regularUser) switchUser(regularUser);
                setActivePage("dashboard");
              }}
              className="btn-outline btn-sm"
              style={{ fontSize: "0.78rem" }}
            >
              Exit to User Closet
            </button>
            <button
              onClick={() => {
                logout();
                setActivePage("auth");
              }}
              className="btn-outline btn-sm"
              style={{ fontSize: "0.78rem", color: "#ff8b8b" }}
            >
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </div>

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
                        Brand: <strong>{it.brand}</strong> &bull; Value: <strong>₹{it.estimatedValue?.toLocaleString('en-IN')}</strong> &bull; Owner: {it.ownerName}
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
