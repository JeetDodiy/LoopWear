import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { loginUser, registerUser } from "../services/api";
import { LogIn, UserPlus, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export function AuthPage({ setActivePage }) {
  const { currentUser, switchUser, allUsers } = useApp();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Brooklyn, NY");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(email);
      switchUser(data.user);
      setSuccess(`Logged in as ${data.user.name}!`);
      setTimeout(() => setActivePage("dashboard"), 800);
    } catch (err) {
      setError(err.message || "Invalid credentials. Try switching to a demo profile below.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email) {
      setError("Please fill in your name and email.");
      return;
    }
    try {
      const data = await registerUser({ name, email, city, bio });
      switchUser(data.user);
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => setActivePage("dashboard"), 800);
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div style={{ padding: "60px 0" }}>
      <div className="content-wrapper" style={{ maxWidth: "680px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="badge badge-yellow" style={{ marginBottom: "12px" }}>
            Identity & Authentication
          </span>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "10px" }}>
            Join the Clothing Swap Movement
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Log in to manage your wardrobe, propose swaps, or switch between demo profiles.
          </p>
        </div>

        {/* 1-Click Quick Demo Profiles Box */}
        <div className="glass-card" style={{ marginBottom: "32px", borderColor: "var(--palette-pink-light)", background: "rgba(255, 166, 251, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Sparkles size={18} color="var(--palette-pink-neon)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Quick 1-Click Demo Profiles</h3>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            Select any profile below to instantly log in and test different user interactions, swap requests, and admin controls:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {allUsers.map((u) => {
              const isSelected = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u);
                    setSuccess(`Switched to ${u.name}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    borderRadius: "var(--radius-md)",
                    background: isSelected ? "var(--palette-pink-neon)" : "var(--bg-surface)",
                    color: isSelected ? "#FFFFFF" : "var(--text-main)",
                    border: isSelected ? "1px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <img src={u.avatar} alt={u.name} style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: "0.72rem", color: isSelected ? "rgba(255,255,255,0.85)" : "var(--text-muted)" }}>
                      {u.role === "admin" ? "Admin Moderator" : u.city}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            className={`btn-outline ${tab === "login" ? "active" : ""}`}
            style={{
              flex: 1,
              justifyContent: "center",
              borderColor: tab === "login" ? "var(--palette-pink-neon)" : "var(--border-subtle)",
              background: tab === "login" ? "rgba(255, 97, 248, 0.1)" : "transparent"
            }}
            onClick={() => setTab("login")}
          >
            <LogIn size={16} /> Log In
          </button>
          <button
            className={`btn-outline ${tab === "register" ? "active" : ""}`}
            style={{
              flex: 1,
              justifyContent: "center",
              borderColor: tab === "register" ? "var(--palette-pink-neon)" : "var(--border-subtle)",
              background: tab === "register" ? "rgba(255, 97, 248, 0.1)" : "transparent"
            }}
            onClick={() => setTab("register")}
          >
            <UserPlus size={16} /> Register New Account
          </button>
        </div>

        {/* Auth Box */}
        <div className="glass-card">
          {error && (
            <div style={{ background: "rgba(255, 75, 75, 0.15)", border: "1px solid #ff4b4b", padding: "12px", borderRadius: "var(--radius-sm)", color: "#ff8b8b", marginBottom: "16px", fontSize: "0.88rem" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(46, 213, 115, 0.15)", border: "1px solid #2ed573", padding: "12px", borderRadius: "var(--radius-sm)", color: "#2ed573", marginBottom: "16px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="maya.lin@swapfashion.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "8px" }}>
                <LogIn size={18} /> Sign In & Access Closet
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Your City / Neighborhood (For Local Swaps)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brooklyn, NY"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Bio & Style Interests
                </label>
                <textarea
                  placeholder="Tell fellow swappers what styles or sizes you love..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <button type="submit" className="btn-secondary" style={{ justifyContent: "center", marginTop: "8px" }}>
                <UserPlus size={18} /> Create Swapper Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
