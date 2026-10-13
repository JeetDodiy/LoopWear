import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { deleteItem, updateSwapStatus, updateUserProfile } from "../services/api";
import { 
  Shirt, 
  ArrowLeftRight, 
  Droplet, 
  Leaf, 
  PlusCircle, 
  Trash2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  Sparkles,
  Camera,
  Upload,
  User,
  Save,
  Check,
  AlertCircle
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
];

export function DashboardPage({ setActivePage, setSelectedItemId, setSelectedSwapId, onOpenAddModal }) {
  const { currentUser, updateCurrentUser, items, swaps, refreshItems, refreshSwaps } = useApp();
  const [activeTab, setActiveTab] = useState("closet"); // 'closet' | 'incoming' | 'outgoing' | 'profile'
  const [actionLoading, setActionLoading] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editBio, setEditBio] = useState(currentUser?.bio || "");
  const [editCity, setEditCity] = useState(currentUser?.city || "");
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [avatarMode, setAvatarMode] = useState("presets"); // 'presets' | 'upload' | 'url'
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || "");
      setEditBio(currentUser.bio || "");
      setEditCity(currentUser.city || "");
      setEditAvatar(currentUser.avatar || "");
    }
  }, [currentUser]);

  // User's own items (newest first)
  const userItems = items
    .filter((i) => i.ownerId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // Swaps where user is target owner (incoming)
  const incomingSwaps = swaps.filter((s) => s.targetOwnerId === currentUser?.id);

  // Swaps where user is requester (outgoing)
  const outgoingSwaps = swaps.filter((s) => s.requesterId === currentUser?.id);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this garment listing?")) return;
    try {
      await deleteItem(itemId);
      await refreshItems();
    } catch (err) {
      alert("Failed to remove item: " + err.message);
    }
  };

  const handleUpdateSwap = async (swapId, newStatus) => {
    setActionLoading(true);
    try {
      await updateSwapStatus(swapId, newStatus);
      await refreshSwaps();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file (JPEG, PNG, WebP).");
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
        setEditAvatar(dataUrl);
        setProfileError("");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    setProfileError("");

    if (!editName.trim()) {
      setProfileError("Name cannot be empty.");
      setProfileSaving(false);
      return;
    }

    try {
      const res = await updateUserProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        city: editCity.trim(),
        location: editCity.trim() ? `${editCity.trim()} (0.5 km away)` : currentUser?.location,
        avatar: editAvatar.trim() || currentUser?.avatar
      });

      updateCurrentUser(res.user);
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 3500);
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: "80px 0" }}>
        <div className="content-wrapper" style={{ maxWidth: "500px", textAlign: "center" }}>
          <div className="glass-card" style={{ padding: "40px" }}>
            <Shirt size={48} color="var(--palette-pink-neon)" style={{ marginBottom: "16px" }} />
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>Sign In to View Your Closet</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
              Please sign in with your user account to track your garments, incoming barter offers, and ecological savings.
            </p>
            <button className="btn-primary" onClick={() => setActivePage("auth")} style={{ justifyContent: "center", width: "100%" }}>
              Go to Member Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper">
        {/* User Profile Header & Sustainability Metric Cards */}
        <div className="glass-card" style={{ marginBottom: "32px", padding: "28px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
            {/* User Identity */}
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <img 
                src={currentUser?.avatar} 
                alt={currentUser?.name} 
                style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--palette-pink-neon)" }} 
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>{currentUser?.name}</h1>
                  <span className="badge badge-pink">{currentUser?.role}</span>
                  <button 
                    className="btn-outline btn-sm" 
                    onClick={() => setActiveTab("profile")}
                    style={{ 
                      fontSize: "0.78rem", 
                      padding: "4px 10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      borderColor: activeTab === "profile" ? "var(--palette-pink-neon)" : "var(--border-subtle)",
                      background: activeTab === "profile" ? "rgba(255, 97, 248, 0.15)" : "transparent"
                    }}
                  >
                    <Camera size={13} /> Edit Profile & Photo
                  </button>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", margin: "4px 0" }}>
                  <MapPin size={14} color="var(--palette-yellow)" /> {currentUser?.location}
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "450px" }}>
                  {currentUser?.bio}
                </p>
              </div>
            </div>

            {/* Sustainability Impact Metric Badges */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255, 234, 108, 0.08)", border: "1px solid rgba(255, 234, 108, 0.3)", borderRadius: "var(--radius-md)", padding: "14px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Garments Exchanged
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--palette-yellow)" }}>
                  {currentUser?.sustainabilityScore?.itemsSwapped || 0}
                </div>
              </div>

              <div style={{ background: "rgba(255, 166, 251, 0.08)", border: "1px solid rgba(255, 166, 251, 0.3)", borderRadius: "var(--radius-md)", padding: "14px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Water Saved
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--palette-pink-light)" }}>
                  {(currentUser?.sustainabilityScore?.waterSavedLiters || 0).toLocaleString()} L
                </div>
              </div>

              <div style={{ background: "rgba(255, 97, 248, 0.08)", border: "1px solid rgba(255, 97, 248, 0.3)", borderRadius: "var(--radius-md)", padding: "14px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  CO₂ Avoided
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--palette-pink-neon)" }}>
                  {currentUser?.sustainabilityScore?.co2SavedKg || 0} kg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs & Post Button */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className={`btn-outline ${activeTab === "closet" ? "active" : ""}`}
              style={{
                borderColor: activeTab === "closet" ? "var(--palette-pink-neon)" : "var(--border-subtle)",
                background: activeTab === "closet" ? "rgba(255, 97, 248, 0.12)" : "transparent"
              }}
              onClick={() => setActiveTab("closet")}
            >
              <Shirt size={16} /> My Wardrobe ({userItems.length})
            </button>

            <button
              className={`btn-outline ${activeTab === "incoming" ? "active" : ""}`}
              style={{
                borderColor: activeTab === "incoming" ? "var(--palette-yellow)" : "var(--border-subtle)",
                background: activeTab === "incoming" ? "rgba(255, 234, 108, 0.12)" : "transparent"
              }}
              onClick={() => setActiveTab("incoming")}
            >
              <ArrowLeftRight size={16} /> Incoming Requests ({incomingSwaps.length})
            </button>

            <button
              className={`btn-outline ${activeTab === "outgoing" ? "active" : ""}`}
              style={{
                borderColor: activeTab === "outgoing" ? "var(--palette-pink-light)" : "var(--border-subtle)",
                background: activeTab === "outgoing" ? "rgba(255, 166, 251, 0.12)" : "transparent"
              }}
              onClick={() => setActiveTab("outgoing")}
            >
              <Clock size={16} /> Sent Proposals ({outgoingSwaps.length})
            </button>

            <button
              className={`btn-outline ${activeTab === "profile" ? "active" : ""}`}
              style={{
                borderColor: activeTab === "profile" ? "var(--palette-yellow)" : "var(--border-subtle)",
                background: activeTab === "profile" ? "rgba(255, 234, 108, 0.12)" : "transparent"
              }}
              onClick={() => setActiveTab("profile")}
            >
              <User size={16} /> Profile & Custom Avatar
            </button>
          </div>

          <button className="btn-secondary" onClick={onOpenAddModal}>
            <PlusCircle size={18} /> Add New Listing
          </button>
        </div>

        {/* Tab 1: My Wardrobe */}
        {activeTab === "closet" && (
          <div>
            {userItems.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "60px 20px" }}>
                <Shirt size={44} color="var(--palette-yellow)" style={{ marginBottom: "12px" }} />
                <h3 style={{ fontSize: "1.2rem", marginBottom: "6px" }}>Your closet is empty</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "18px" }}>
                  Upload a garment you no longer wear to start exchanging with others.
                </p>
                <button className="btn-primary" onClick={onOpenAddModal}>
                  List Your First Garment
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {userItems.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-card-image-box">
                      <img src={item.images[0]} alt={item.title} className="item-card-image" />
                      <div className="item-card-value-tag">~₹{item.estimatedValue?.toLocaleString('en-IN')}</div>
                      <div style={{ position: "absolute", bottom: "10px", left: "10px" }}>
                        <span className={`badge ${item.status === "available" ? "badge-green" : "badge-yellow"}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="item-card-body">
                      <div className="item-card-meta">
                        <span className="item-card-brand">{item.brand}</span>
                        <span className="badge badge-cream" style={{ fontSize: "0.7rem" }}>{item.condition}</span>
                      </div>
                      <h4 className="item-card-title">{item.title}</h4>

                      <div className="item-card-footer">
                        <button 
                          className="btn-outline btn-sm"
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setActivePage("item-detail");
                          }}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn-outline btn-sm" 
                          style={{ color: "#ff8b8b", borderColor: "rgba(255, 75, 75, 0.3)" }}
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Requests */}
        {activeTab === "incoming" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {incomingSwaps.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-muted)" }}>
                No incoming swap requests at the moment.
              </div>
            ) : (
              incomingSwaps.map((s) => (
                <div key={s.id} className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <img src={s.offeredItemImage} alt="offered" style={{ width: "64px", height: "64px", borderRadius: "10px", objectFit: "cover" }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 800, fontSize: "1rem" }}>{s.requesterName}</span>
                        <span className="badge badge-yellow">Offered {s.offeredItemTitle}</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        In exchange for your <strong>{s.targetItemTitle}</strong> &bull; Fairness: {s.fairnessScore}%
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--palette-pink-light)", marginTop: "4px" }}>
                        Note: "{s.note}"
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => {
                        setSelectedSwapId(s.id);
                        setActivePage("chat");
                      }}
                    >
                      <MessageSquare size={14} /> Chat & Negotiate
                    </button>
                    {s.status === "pending" && (
                      <>
                        <button
                          className="btn-primary btn-sm"
                          disabled={actionLoading}
                          onClick={() => handleUpdateSwap(s.id, "accepted")}
                        >
                          <CheckCircle2 size={14} /> Accept
                        </button>
                        <button
                          className="btn-outline btn-sm"
                          style={{ color: "#ff8b8b" }}
                          disabled={actionLoading}
                          onClick={() => handleUpdateSwap(s.id, "rejected")}
                        >
                          <XCircle size={14} /> Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Outgoing Proposals */}
        {activeTab === "outgoing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {outgoingSwaps.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-muted)" }}>
                You have not sent any swap proposals yet.
              </div>
            ) : (
              outgoingSwaps.map((s) => (
                <div key={s.id} className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <img src={s.targetItemImage} alt="target" style={{ width: "64px", height: "64px", borderRadius: "10px", objectFit: "cover" }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 800, fontSize: "1rem" }}>{s.targetItemTitle}</span>
                        <span className={`badge ${s.status === "accepted" ? "badge-green" : "badge-yellow"}`}>
                          {s.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Owned by <strong>{s.targetOwnerName}</strong> &bull; You offered: {s.offeredItemTitle}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => {
                        setSelectedSwapId(s.id);
                        setActivePage("chat");
                      }}
                    >
                      <MessageSquare size={14} /> View Chat & Negotiation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: My Profile & Avatar Settings */}
        {activeTab === "profile" && (
          <div className="glass-card" style={{ padding: "32px", border: "1px solid rgba(255, 97, 248, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px" }}>
                  <User color="var(--palette-pink-neon)" /> Member Profile & Avatar Studio
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Personalize your identity, upload your own photo, and maintain your clothing swap preferences.
                </p>
              </div>

              {profileMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(94, 234, 212, 0.15)", border: "1px solid #5eead4", color: "#5eead4", padding: "8px 16px", borderRadius: "var(--radius-sm)", fontSize: "0.88rem", fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> {profileMsg}
                </div>
              )}

              {profileError && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 107, 107, 0.15)", border: "1px solid #ff6b6b", color: "#ff6b6b", padding: "8px 16px", borderRadius: "var(--radius-sm)", fontSize: "0.88rem", fontWeight: 700 }}>
                  <AlertCircle size={16} /> {profileError}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "32px" }}>
              {/* Left Column: Avatar Customization */}
              <div style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <img
                    src={editAvatar || currentUser?.avatar}
                    alt={currentUser?.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid var(--palette-pink-neon)",
                      boxShadow: "0 0 20px rgba(255, 97, 248, 0.35)"
                    }}
                  />
                  <span style={{
                    position: "absolute",
                    bottom: "4px",
                    right: "4px",
                    background: "var(--palette-yellow)",
                    color: "#000",
                    padding: "4px",
                    borderRadius: "50%",
                    display: "flex"
                  }}>
                    <Camera size={14} />
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{currentUser?.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "18px" }}>
                  @{currentUser?.username || "member"} &bull; {currentUser?.role?.toUpperCase()}
                </div>

                {/* Avatar Source Switcher */}
                <div style={{ display: "flex", gap: "6px", width: "100%", marginBottom: "16px" }}>
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    style={{
                      flex: 1,
                      fontSize: "0.75rem",
                      padding: "6px",
                      justifyContent: "center",
                      background: avatarMode === "presets" ? "rgba(255, 97, 248, 0.15)" : "transparent",
                      borderColor: avatarMode === "presets" ? "var(--palette-pink-neon)" : "var(--border-subtle)"
                    }}
                    onClick={() => setAvatarMode("presets")}
                  >
                    Curated Avatars
                  </button>
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    style={{
                      flex: 1,
                      fontSize: "0.75rem",
                      padding: "6px",
                      justifyContent: "center",
                      background: avatarMode === "upload" ? "rgba(255, 97, 248, 0.15)" : "transparent",
                      borderColor: avatarMode === "upload" ? "var(--palette-pink-neon)" : "var(--border-subtle)"
                    }}
                    onClick={() => setAvatarMode("upload")}
                  >
                    <Upload size={12} /> Upload File
                  </button>
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    style={{
                      flex: 1,
                      fontSize: "0.75rem",
                      padding: "6px",
                      justifyContent: "center",
                      background: avatarMode === "url" ? "rgba(255, 97, 248, 0.15)" : "transparent",
                      borderColor: avatarMode === "url" ? "var(--palette-pink-neon)" : "var(--border-subtle)"
                    }}
                    onClick={() => setAvatarMode("url")}
                  >
                    Web Link
                  </button>
                </div>

                {/* Mode: Preset Gallery */}
                {avatarMode === "presets" && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                    {AVATAR_PRESETS.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt={`Preset ${i + 1}`}
                        onClick={() => setEditAvatar(p)}
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: editAvatar === p ? "2px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                          transform: editAvatar === p ? "scale(1.15)" : "scale(1)",
                          transition: "all 0.15s ease"
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Mode: Upload Custom File */}
                {avatarMode === "upload" && (
                  <div style={{ width: "100%" }}>
                    <input
                      type="file"
                      id="dashboard-avatar-upload"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="dashboard-avatar-upload"
                      className="btn-outline btn-sm"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: "pointer",
                        width: "100%",
                        padding: "10px",
                        borderColor: "var(--palette-yellow)",
                        color: "var(--palette-yellow)"
                      }}
                    >
                      <Upload size={16} /> Choose Image From Computer
                    </label>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "8px" }}>
                      PNG, JPG, or WebP. Automatically optimized & compressed for instant speed.
                    </p>
                  </div>
                )}

                {/* Mode: Web URL */}
                {avatarMode === "url" && (
                  <div style={{ width: "100%" }}>
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        if (e.target.value.trim()) setEditAvatar(e.target.value.trim());
                      }}
                      style={{ width: "100%", fontSize: "0.85rem", padding: "8px 12px", marginBottom: "8px" }}
                    />
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Live preview updates instantly above.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Editable Profile Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your display name"
                    style={{ width: "100%" }}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                      Username (Unique ID)
                    </label>
                    <input
                      type="text"
                      value={currentUser?.username || ""}
                      disabled
                      style={{ width: "100%", opacity: 0.7, cursor: "not-allowed", background: "rgba(255, 255, 255, 0.02)" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ""}
                      disabled
                      style={{ width: "100%", opacity: 0.7, cursor: "not-allowed", background: "rgba(255, 255, 255, 0.02)" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                    City / Neighborhood (India)
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Bandra West, Mumbai, MH"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Bio & Clothing Exchange Preferences
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell other swappers about your preferred brands, sizes, and style interests..."
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Submit & Reset Buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={profileSaving}
                    style={{ padding: "12px 24px" }}
                  >
                    <Save size={16} /> {profileSaving ? "Saving Changes..." : "Save Profile Changes"}
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      if (currentUser) {
                        setEditName(currentUser.name || "");
                        setEditBio(currentUser.bio || "");
                        setEditCity(currentUser.city || "");
                        setEditAvatar(currentUser.avatar || "");
                        setProfileMsg("");
                        setProfileError("");
                      }
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
