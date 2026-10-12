import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { deleteItem, updateSwapStatus } from "../services/api";
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
  Sparkles 
} from "lucide-react";

export function DashboardPage({ setActivePage, setSelectedItemId, setSelectedSwapId, onOpenAddModal }) {
  const { currentUser, items, swaps, refreshItems, refreshSwaps } = useApp();
  const [activeTab, setActiveTab] = useState("closet"); // 'closet' | 'incoming' | 'outgoing'
  const [actionLoading, setActionLoading] = useState(false);

  // User's own items
  const userItems = items.filter((i) => i.ownerId === currentUser?.id);

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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>{currentUser?.name}</h1>
                  <span className="badge badge-pink">{currentUser?.role}</span>
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
          <div style={{ display: "flex", gap: "10px" }}>
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
      </div>
    </div>
  );
}
