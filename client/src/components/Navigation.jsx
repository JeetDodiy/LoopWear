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
  LogOut, 
  LogIn 
} from "lucide-react";

export function Navbar({ activePage, setActivePage, onOpenAddModal }) {
  const { currentUser, logout, theme, toggleTheme, pendingIncomingCount } = useApp();
  const isAdmin = currentUser?.role === "admin";

  return (
    <header className="navbar">
      <div className="content-wrapper nav-inner">
        {/* Brand Logo */}
        <div 
          className="nav-brand" 
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} 
          onClick={() => setActivePage(isAdmin ? "admin" : "landing")}
        >
          <img 
            src="/logo.png" 
            alt="LoopWear Logo" 
            style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover", boxShadow: "var(--glow-pink)" }} 
          />
          <span className="brand-text">LoopWear</span>
          <span className={isAdmin ? "badge badge-yellow" : "badge badge-pink"} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
            {isAdmin ? "ADMIN" : "SWAP"}
          </span>
        </div>

        {/* Navigation Links - STRICTLY ONE PANEL PER ROLE */}
        <nav className="nav-links">
          {isAdmin ? (
            <>
              <button 
                className={`nav-link-btn ${activePage === "admin" ? "active" : ""}`}
                onClick={() => setActivePage("admin")}
                style={{
                  color: "var(--palette-yellow)",
                  fontWeight: 800,
                  background: "rgba(255, 234, 108, 0.12)",
                  borderRadius: "var(--radius-sm)"
                }}
              >
                <ShieldCheck size={16} color="var(--palette-yellow)" /> Admin Panel
              </button>
              <button 
                className={`nav-link-btn ${activePage === "listings" ? "active" : ""}`}
                onClick={() => setActivePage("listings")}
              >
                <Shirt size={16} /> Review Listings
              </button>
              <button 
                className={`nav-link-btn ${activePage === "landing" ? "active" : ""}`}
                onClick={() => setActivePage("landing")}
              >
                <Compass size={16} /> Home
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>

        {/* Actions & Single Current User Display (No Dropdown Menu) */}
        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!isAdmin && (
            <button 
              className="btn-secondary btn-sm"
              onClick={onOpenAddModal}
              title="List an item to exchange"
            >
              <PlusCircle size={16} /> List Item
            </button>
          )}

          {/* Theme Toggle */}
          <button 
            className="btn-outline btn-sm"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            style={{ padding: "8px" }}
          >
            {theme === "dark" ? <Sun size={17} color="#FFEA6C" /> : <Moon size={17} />}
          </button>

          {/* Single User Identity Pill with Direct Log Out */}
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                className="btn-outline btn-sm"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  padding: "5px 12px",
                  borderColor: isAdmin ? "var(--palette-yellow)" : "var(--palette-pink-neon)",
                  background: isAdmin ? "rgba(255, 234, 108, 0.08)" : "rgba(255, 97, 248, 0.08)"
                }}
                onClick={() => setActivePage(isAdmin ? "admin" : "dashboard")}
                title={isAdmin ? "Go to Admin Panel" : "Go to My Closet"}
              >
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} 
                  />
                ) : (
                  <User size={16} />
                )}
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                  {currentUser.name}
                </span>
                <span className={isAdmin ? "badge badge-yellow" : "badge badge-pink"} style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                  {isAdmin ? "Admin" : "User"}
                </span>
              </button>

              <button
                className="btn-outline btn-sm"
                onClick={() => {
                  logout();
                  setActivePage("auth");
                }}
                title="Log out"
                style={{ padding: "7px 10px", color: "#ff8b8b", borderColor: "rgba(255, 75, 75, 0.3)" }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              className="btn-primary btn-sm"
              onClick={() => setActivePage("auth")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <LogIn size={15} /> Sign In
            </button>
          )}
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
