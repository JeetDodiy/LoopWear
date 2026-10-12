import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  ArrowLeftRight, 
  Sparkles, 
  Shirt, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  Sun, 
  Moon, 
  PlusCircle, 
  Compass, 
  ChevronDown 
} from "lucide-react";

export function Navbar({ activePage, setActivePage, onOpenAddModal, onOpenAdminAuth, onOpenUserAuth }) {
  const { currentUser, allUsers, switchUser, logout, theme, toggleTheme, pendingIncomingCount } = useApp();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isAdmin = currentUser?.role === "admin";

  return (
    <header className="navbar">
      <div className="content-wrapper nav-inner">
        {/* Brand Logo */}
        <div 
          className="nav-brand" 
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} 
          onClick={() => setActivePage("landing")}
        >
          <img 
            src="/logo.png" 
            alt="LoopWear Logo" 
            style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover", boxShadow: "var(--glow-pink)" }} 
          />
          <span className="brand-text">LoopWear</span>
          <span className="badge badge-yellow" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
            SWAP
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          <button 
            className={`nav-link-btn ${activePage === "landing" ? "active" : ""}`}
            onClick={() => setActivePage("landing")}
          >
            <Compass size={16} /> Explore
          </button>
          <button 
            className={`nav-link-btn ${activePage === "listings" ? "active" : ""}`}
            onClick={() => setActivePage("listings")}
          >
            <Shirt size={16} /> Browse Clothes
          </button>
          <button 
            className={`nav-link-btn ${activePage === "chat" ? "active" : ""}`}
            onClick={() => setActivePage("chat")}
            style={{ position: "relative" }}
          >
            <MessageSquare size={16} /> Chat & Deals
            {pendingIncomingCount > 0 && (
              <span style={{
                position: "absolute",
                top: "2px",
                right: "4px",
                background: "var(--palette-pink-neon)",
                color: "#fff",
                fontSize: "0.68rem",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800
              }}>
                {pendingIncomingCount}
              </span>
            )}
          </button>
          
          <button 
            className={`nav-link-btn ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => setActivePage("dashboard")}
          >
            <User size={16} /> My Closet
          </button>

          {/* Admin Link - Highlighted if logged in as Admin */}
          <button 
            className={`nav-link-btn ${activePage === "admin" ? "active" : ""}`}
            onClick={() => setActivePage("admin")}
            style={isAdmin ? {
              color: "var(--palette-yellow)",
              fontWeight: 800,
              background: "rgba(255, 234, 108, 0.12)",
              borderRadius: "var(--radius-sm)"
            } : {}}
          >
            <ShieldCheck size={16} color={isAdmin ? "var(--palette-yellow)" : "currentColor"} /> 
            {isAdmin ? "Admin Control" : "Admin Panel 🔒"}
          </button>
        </nav>

        {/* Actions & User Switcher */}
        <div className="nav-actions">
          {/* Post item quick button */}
          <button 
            className="btn-secondary btn-sm"
            onClick={onOpenAddModal}
            title="List an item to exchange"
          >
            <PlusCircle size={16} /> List Item
          </button>

          {/* Theme Toggle */}
          <button 
            className="btn-outline btn-sm"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            style={{ padding: "8px" }}
          >
            {theme === "dark" ? <Sun size={17} color="#FFEA6C" /> : <Moon size={17} />}
          </button>

          {/* User Profile / Quick Switcher */}
          <div style={{ position: "relative" }}>
            <button 
              className="btn-outline btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px" }}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} 
                />
              ) : (
                <User size={18} />
              )}
              <span style={{ fontSize: "0.85rem", fontWeight: 700, maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.name?.split(" ")[0] || "Account"}
              </span>
              <ChevronDown size={14} />
            </button>

            {/* Switcher Dropdown */}
            {showUserDropdown && (
              <div 
                style={{
                  position: "absolute",
                  right: 0,
                  top: "120%",
                  width: "260px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  padding: "12px",
                  zIndex: 200
                }}
              >
                <div style={{ paddingBottom: "10px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "8px" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Switch Demo Profile
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--palette-pink-light)" }}>
                    Current: <strong>{currentUser?.name}</strong> ({currentUser?.role})
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setShowUserDropdown(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px",
                        borderRadius: "var(--radius-sm)",
                        background: currentUser?.id === u.id ? "rgba(255, 97, 248, 0.15)" : "transparent",
                        border: currentUser?.id === u.id ? "1px solid var(--palette-pink-neon)" : "1px solid transparent",
                        textAlign: "left",
                        color: "var(--text-main)",
                        width: "100%"
                      }}
                    >
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} 
                      />
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }}>{u.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {u.role === "admin" ? "Platform Admin" : u.city}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={() => {
                      if (onOpenUserAuth) onOpenUserAuth();
                      else setActivePage("auth");
                      setShowUserDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      fontSize: "0.8rem",
                      color: "var(--palette-pink-light)",
                      background: "rgba(255, 97, 248, 0.08)",
                      border: "1px solid rgba(255, 97, 248, 0.2)",
                      padding: "6px 10px",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    👤 User Sign In Panel &rarr;
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenAdminAuth) onOpenAdminAuth();
                      else setActivePage("auth");
                      setShowUserDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      fontSize: "0.8rem",
                      color: "var(--palette-yellow)",
                      background: "rgba(255, 234, 108, 0.08)",
                      border: "1px solid rgba(255, 234, 108, 0.2)",
                      padding: "6px 10px",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    🛡️ Admin Sign In Panel &rarr;
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setActivePage("auth");
                      setShowUserDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      background: "transparent",
                      border: "none",
                      padding: "4px",
                      textAlign: "center",
                      cursor: "pointer"
                    }}
                  >
                    Log Out of Current Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer({ setActivePage }) {
  return (
    <footer style={{ 
      background: "var(--bg-surface)", 
      borderTop: "1px solid var(--border-subtle)", 
      padding: "48px 0 32px 0",
      marginTop: "auto"
    }}>
      <div className="content-wrapper">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px", marginBottom: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <img 
                src="/logo.png" 
                alt="LoopWear Logo" 
                style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover" }} 
              />
              <span className="brand-text" style={{ fontSize: "1.2rem", fontWeight: 800 }}>LoopWear</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Community clothing exchange & swap marketplace promoting zero textile waste and sustainable fashion through fair barter trading.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "14px", color: "var(--palette-yellow)" }}>Explore Marketplace</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              <li><a href="#explore" onClick={(e) => { e.preventDefault(); setActivePage("listings"); }}>Browse Outerwear & Jackets</a></li>
              <li><a href="#vintage" onClick={(e) => { e.preventDefault(); setActivePage("listings"); }}>Rare 90s & Vintage Finds</a></li>
              <li><a href="#calculator" onClick={(e) => { e.preventDefault(); setActivePage("listings"); }}>Fair Swap Value Calculator</a></li>
              <li><a href="#nearby" onClick={(e) => { e.preventDefault(); setActivePage("listings"); }}>Location-Based Swaps</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "14px", color: "var(--palette-pink-light)" }}>Platform & Impact</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              <li><a href="#howitworks" onClick={(e) => { e.preventDefault(); setActivePage("landing"); }}>How Clothing Swapping Works</a></li>
              <li><a href="#dashboard" onClick={(e) => { e.preventDefault(); setActivePage("dashboard"); }}>Sustainability Water Tracker</a></li>
              <li><a href="#admin" onClick={(e) => { e.preventDefault(); setActivePage("admin"); }}>Admin Moderation & Disputes</a></li>
              <li><a href="#guidelines" onClick={(e) => { e.preventDefault(); setActivePage("landing"); }}>Community Guidelines</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "14px", color: "var(--palette-pink-neon)" }}>Environmental Impact</h4>
            <div style={{ background: "rgba(255, 97, 248, 0.08)", border: "1px solid rgba(255, 97, 248, 0.2)", borderRadius: "var(--radius-md)", padding: "14px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Average Water Saved Per Swap:</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--palette-yellow)", margin: "4px 0" }}>2,700 Litres</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Equivalent to 35 domestic showers saved per garment re-homed.</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", fontSize: "0.82rem", color: "var(--text-dim)" }}>
          <div>&copy; 2026 LoopWear Marketplace. Sustainable Barter Economy Project.</div>
          <div style={{ display: "flex", gap: "18px" }}>
            <span>UN SDG 12: Responsible Consumption</span>
            <span>Zero Cash &bull; Pure Swaps</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
