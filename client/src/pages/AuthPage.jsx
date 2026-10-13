import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { loginUser, registerUser } from "../services/api";
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  User, 
  Key, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowRight,
  Shield,
  Camera,
  Upload,
  Image as ImageIcon
} from "lucide-react";

const REGISTER_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
];

export function AuthPage({ setActivePage, initialPanel = "user", onSwitchTargetPanel }) {
  const { currentUser, switchUser, allUsers } = useApp();
  
  // Panel mode: 'user' | 'admin'
  const [panel, setPanel] = useState(initialPanel || "user");
  
  // User subtab: 'login' | 'register'
  const [userTab, setUserTab] = useState("login");

  // User Form fields
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCity, setRegCity] = useState("Bandra, Mumbai");
  const [regBio, setRegBio] = useState("");
  const [regAvatar, setRegAvatar] = useState(REGISTER_AVATARS[0]);
  const [avatarUploadMode, setAvatarUploadMode] = useState("preset"); // 'preset' | 'file' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState("");

  // Admin Form fields
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (initialPanel) {
      setPanel(initialPanel);
    }
  }, [initialPanel]);

  const handlePanelChange = (newPanel) => {
    setPanel(newPanel);
    setError("");
    setSuccess("");
    if (onSwitchTargetPanel) onSwitchTargetPanel(newPanel);
  };

  // User Login Handler
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await loginUser({
        username: userUsername.trim(),
        password: userPassword.trim(),
        requiredRole: "user"
      });

      switchUser(res.user);
      setSuccess(`Welcome back, ${res.user.name}! Accessing your wardrobe...`);
      setTimeout(() => {
        setActivePage("dashboard");
      }, 700);
    } catch (err) {
      setError(err.message || "Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload and compression for profile photo
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setRegAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // User Registration Handler
  const handleUserRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!regName.trim() || !regEmail.trim() || !regUsername.trim()) {
      setError("Please fill in your name, username, and email address.");
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(regEmail.trim())) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      setLoading(false);
      return;
    }

    // Username format validation
    const cleanUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters and contain only letters, numbers, or underscores.");
      setLoading(false);
      return;
    }

    // Password strength
    if (!regPassword || regPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser({
        name: regName.trim(),
        username: cleanUsername,
        email: regEmail.trim(),
        password: regPassword.trim(),
        city: regCity.trim(),
        bio: regBio.trim(),
        avatar: regAvatar || undefined
      });

      switchUser(res.user);
      setSuccess("Account successfully created! Directing to your new closet...");
      setTimeout(() => {
        setActivePage("dashboard");
      }, 700);
    } catch (err) {
      setError(err.message || "Registration failed. Please check information.");
    } finally {
      setLoading(false);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await loginUser({
        username: adminUsername.trim(),
        password: adminPassword.trim(),
        requiredRole: "admin"
      });

      switchUser(res.user);
      setSuccess(`Administrator Verified: ${res.user.name}. Opening Admin Control Center...`);
      setTimeout(() => {
        setActivePage("admin");
      }, 700);
    } catch (err) {
      setError(err.message || "Admin authorization rejected. Please check supervisor credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px 0 80px 0" }}>
      <div className="content-wrapper" style={{ maxWidth: "720px" }}>
        
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="badge badge-yellow" style={{ marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Key size={13} /> Secure Authentication Gateway
          </span>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "8px" }}>
            Sign In to LoopWear
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Select your destination portal below to sign in with your credentials.
          </p>
        </div>

        {/* ================= PORTAL SELECTOR CARDS ================= */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "16px", 
          marginBottom: "28px" 
        }}>
          {/* Option 1: User Portal */}
          <button
            type="button"
            onClick={() => handlePanelChange("user")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "20px",
              borderRadius: "var(--radius-md)",
              border: panel === "user" ? "2px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
              background: panel === "user" ? "rgba(255, 97, 248, 0.12)" : "var(--bg-surface)",
              boxShadow: panel === "user" ? "var(--glow-pink)" : "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ 
                width: "38px", 
                height: "38px", 
                borderRadius: "10px", 
                background: panel === "user" ? "var(--palette-pink-neon)" : "rgba(255, 255, 255, 0.08)",
                color: panel === "user" ? "#FFFFFF" : "var(--palette-pink-light)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <User size={20} />
              </div>
              <span className="badge badge-pink" style={{ fontSize: "0.72rem" }}>
                Member Portal
              </span>
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "4px" }}>
              User Sign In
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Browse wardrobe items, propose trades & negotiate deals.
            </div>
          </button>

          {/* Option 2: Admin Portal */}
          <button
            type="button"
            onClick={() => handlePanelChange("admin")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "20px",
              borderRadius: "var(--radius-md)",
              border: panel === "admin" ? "2px solid var(--palette-yellow)" : "1px solid var(--border-subtle)",
              background: panel === "admin" ? "rgba(255, 234, 108, 0.12)" : "var(--bg-surface)",
              boxShadow: panel === "admin" ? "var(--glow-yellow)" : "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ 
                width: "38px", 
                height: "38px", 
                borderRadius: "10px", 
                background: panel === "admin" ? "var(--palette-yellow)" : "rgba(255, 255, 255, 0.08)",
                color: panel === "admin" ? "#12141D" : "var(--palette-yellow)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <ShieldCheck size={20} />
              </div>
              <span className="badge badge-yellow" style={{ fontSize: "0.72rem" }}>
                Restricted Panel
              </span>
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "4px" }}>
              Admin Portal
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Supervisor command center, dispute resolution & audits.
            </div>
          </button>
        </div>

        {/* ================= ALERTS ================= */}
        {error && (
          <div style={{ 
            background: "rgba(255, 75, 75, 0.12)", 
            border: "1px solid #ff4b4b", 
            padding: "14px 18px", 
            borderRadius: "var(--radius-sm)", 
            color: "#ff8b8b", 
            marginBottom: "20px", 
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ 
            background: "rgba(46, 213, 115, 0.12)", 
            border: "1px solid #2ed573", 
            padding: "14px 18px", 
            borderRadius: "var(--radius-sm)", 
            color: "#2ed573", 
            marginBottom: "20px", 
            fontSize: "0.9rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "10px" 
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* ================= PANEL 1: USER PORTAL ================= */}
        {panel === "user" && (
          <div className="glass-card" style={{ borderColor: "rgba(255, 97, 248, 0.3)" }}>
            
            {/* User Tab Switch (Login vs Register) */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <button
                type="button"
                className={`btn-outline ${userTab === "login" ? "active" : ""}`}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  borderColor: userTab === "login" ? "var(--palette-pink-neon)" : "var(--border-subtle)",
                  background: userTab === "login" ? "rgba(255, 97, 248, 0.15)" : "transparent"
                }}
                onClick={() => { setUserTab("login"); setError(""); }}
              >
                <LogIn size={16} /> Member Sign In
              </button>
              <button
                type="button"
                className={`btn-outline ${userTab === "register" ? "active" : ""}`}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  borderColor: userTab === "register" ? "var(--palette-pink-neon)" : "var(--border-subtle)",
                  background: userTab === "register" ? "rgba(255, 97, 248, 0.15)" : "transparent"
                }}
                onClick={() => { setUserTab("register"); setError(""); }}
              >
                <UserPlus size={16} /> Register New Account
              </button>
            </div>

            {userTab === "login" ? (
              <div>
                <form onSubmit={handleUserLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                      User Name or Email
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. maya or maya.lin@swapfashion.org"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      style={{ width: "100%" }}
                      required
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-muted)" }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your user password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      style={{ width: "100%" }}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading}
                    style={{ justifyContent: "center", marginTop: "10px", padding: "14px", fontSize: "1rem" }}
                  >
                    <LogIn size={18} /> {loading ? "Signing In..." : "Log In & Enter User Closet"}
                  </button>
                </form>
              </div>
            ) : (
              /* User Register Form */
              <form onSubmit={handleUserRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      style={{ width: "100%" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                      Choose Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. aarav_wear"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      style={{ width: "100%" }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="aarav@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
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
                      placeholder="Create a password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      style={{ width: "100%" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                    City / Neighborhood (India)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bandra West, Mumbai, MH"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                    Bio & Clothing Exchange Preferences
                  </label>
                  <textarea
                    placeholder="Tell other swappers what fashion sizes or styles you love..."
                    rows={2}
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Profile Photo Selector Segment */}
                <div style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(255, 255, 255, 0.02)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--palette-pink-light)", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                      <Camera size={16} /> Choose or Upload Profile Photo
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Your avatar across LoopWear</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    {/* Live Preview */}
                    <div style={{ position: "relative" }}>
                      <img
                        src={regAvatar || REGISTER_AVATARS[0]}
                        alt="Profile Preview"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid var(--palette-pink-neon)",
                          boxShadow: "var(--glow-pink)"
                        }}
                      />
                    </div>

                    {/* Mode Toggle & Inputs */}
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            background: avatarUploadMode === "preset" ? "rgba(255, 97, 248, 0.15)" : "transparent",
                            borderColor: avatarUploadMode === "preset" ? "var(--palette-pink-neon)" : "var(--border-subtle)"
                          }}
                          onClick={() => setAvatarUploadMode("preset")}
                        >
                          Preset Avatars
                        </button>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            background: avatarUploadMode === "file" ? "rgba(255, 97, 248, 0.15)" : "transparent",
                            borderColor: avatarUploadMode === "file" ? "var(--palette-pink-neon)" : "var(--border-subtle)"
                          }}
                          onClick={() => setAvatarUploadMode("file")}
                        >
                          <Upload size={12} /> Upload Photo
                        </button>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            background: avatarUploadMode === "url" ? "rgba(255, 97, 248, 0.15)" : "transparent",
                            borderColor: avatarUploadMode === "url" ? "var(--palette-pink-neon)" : "var(--border-subtle)"
                          }}
                          onClick={() => setAvatarUploadMode("url")}
                        >
                          Image Link
                        </button>
                      </div>

                      {avatarUploadMode === "preset" && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          {REGISTER_AVATARS.map((av, idx) => (
                            <img
                              key={idx}
                              src={av}
                              alt={`Preset ${idx + 1}`}
                              onClick={() => setRegAvatar(av)}
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                cursor: "pointer",
                                border: regAvatar === av ? "2px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                                transform: regAvatar === av ? "scale(1.15)" : "scale(1)",
                                transition: "transform 0.15s ease"
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {avatarUploadMode === "file" && (
                        <div>
                          <input
                            type="file"
                            id="reg-avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            style={{ display: "none" }}
                          />
                          <label
                            htmlFor="reg-avatar-upload"
                            className="btn-outline btn-sm"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              padding: "6px 14px",
                              color: "var(--palette-yellow)",
                              borderColor: "var(--palette-yellow)"
                            }}
                          >
                            <Upload size={14} /> Choose Image from Device
                          </label>
                        </div>
                      )}

                      {avatarUploadMode === "url" && (
                        <div>
                          <input
                            type="url"
                            placeholder="Paste image URL (https://...)"
                            value={customUrlInput}
                            onChange={(e) => {
                              setCustomUrlInput(e.target.value);
                              if (e.target.value.trim()) setRegAvatar(e.target.value.trim());
                            }}
                            style={{ width: "100%", fontSize: "0.82rem", padding: "6px 10px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-secondary" 
                  disabled={loading}
                  style={{ justifyContent: "center", marginTop: "10px", padding: "14px" }}
                >
                  <UserPlus size={18} /> {loading ? "Creating..." : "Create Swapper Account"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= PANEL 2: ADMIN PORTAL ================= */}
        {panel === "admin" && (
          <div className="glass-card" style={{ borderColor: "rgba(255, 234, 108, 0.4)", background: "rgba(18, 20, 29, 0.95)" }}>
            
            {/* Admin Portal Header Banner */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "14px", 
              borderRadius: "var(--radius-sm)", 
              background: "rgba(255, 234, 108, 0.08)",
              border: "1px solid rgba(255, 234, 108, 0.2)",
              marginBottom: "24px" 
            }}>
              <Shield size={24} color="var(--palette-yellow)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--palette-yellow)" }}>
                  LoopWear Supervisor Security Gateway
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Administrative access is restricted to verified operations personnel.
                </div>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
                  Admin Username or Official Email
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
                  <label style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter administrator password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div style={{ 
                fontSize: "0.8rem", 
                color: "var(--text-muted)", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)"
              }}>
                <Lock size={14} color="var(--palette-yellow)" />
                RBAC Level 1: Full moderative access, audit logs & dispute overrides.
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ 
                  justifyContent: "center", 
                  marginTop: "8px", 
                  padding: "14px", 
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, var(--palette-yellow), #e09b00)",
                  color: "#12141D"
                }}
              >
                <ShieldCheck size={18} /> {loading ? "Verifying Authority..." : "Log In to Admin Panel"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
