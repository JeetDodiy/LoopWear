import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { createSwapRequest } from "../services/api";
import { 
  ArrowLeft, 
  ArrowLeftRight, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Scale 
} from "lucide-react";

export function SwapRequestPage({ itemId, setActivePage, setSelectedSwapId }) {
  const { items, currentUser, refreshSwaps } = useApp();

  const targetItem = items.find((i) => i.id === itemId) || items[0];
  const userItems = items.filter(
    (i) => i.ownerId === currentUser?.id && i.id !== targetItem?.id && i.status === "available"
  );

  const [selectedOfferedId, setSelectedOfferedId] = useState(userItems[0]?.id || "");
  const [exchangeType, setExchangeType] = useState("local_meetup");
  const [locationProposal, setLocationProposal] = useState(
    exchangeType === "local_meetup" ? "Greenpoint Local Coffee Co." : "Standard Tracked Courier Box"
  );
  const [note, setNote] = useState("Hey! I really love this piece and would be thrilled to exchange it for my item. Let me know if you'd like to make this trade!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const offeredItem = items.find((i) => i.id === selectedOfferedId);

  // Fairness calculation
  const valA = targetItem?.estimatedValue || 100;
  const valB = offeredItem?.estimatedValue || 100;
  const fairnessScore = Math.round((Math.min(valA, valB) / Math.max(valA, valB)) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeredItem) {
      setError("Please choose an item from your closet to propose in exchange.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const newSwap = await createSwapRequest({
        requesterId: currentUser.id,
        targetItemId: targetItem.id,
        offeredItemId: offeredItem.id,
        exchangeType,
        locationProposal,
        note
      });

      await refreshSwaps();
      if (setSelectedSwapId) {
        setSelectedSwapId(newSwap.id);
      }
      setActivePage("chat");
    } catch (err) {
      setError(err.message || "Failed to submit swap proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper" style={{ maxWidth: "880px" }}>
        {/* Navigation */}
        <button 
          className="btn-outline btn-sm" 
          onClick={() => setActivePage("item-detail")}
          style={{ marginBottom: "24px" }}
        >
          <ArrowLeft size={16} /> Back to Item
        </button>

        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="badge badge-pink" style={{ marginBottom: "10px" }}>
            Proposal Builder
          </span>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800 }}>Propose Clothing Swap</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Select an item from your wardrobe to offer {targetItem?.ownerName} in exchange.
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(255, 75, 75, 0.15)", border: "1px solid #ff4b4b", padding: "14px", borderRadius: "var(--radius-md)", color: "#ff8b8b", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Side by side comparison card */}
        <div className="glass-card" style={{ marginBottom: "32px", padding: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "24px", alignItems: "center" }}>
            {/* Target Item (Wanted) */}
            <div style={{ textAlign: "center" }}>
              <span className="badge badge-yellow" style={{ marginBottom: "8px" }}>Item You Want</span>
              <div style={{ width: "100%", height: "180px", borderRadius: "var(--radius-md)", overflow: "hidden", margin: "10px 0" }}>
                <img src={targetItem?.images[0]} alt={targetItem?.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>{targetItem?.title}</h4>
              <div style={{ color: "var(--palette-yellow)", fontWeight: 800 }}>~₹{targetItem?.estimatedValue?.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Owner: {targetItem?.ownerName}</div>
            </div>

            {/* Swap Arrow & Fairness Indicator */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--gradient-brand)",
                color: "#121316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                boxShadow: "var(--glow-pink)"
              }}>
                <ArrowLeftRight size={22} />
              </div>
              <div style={{
                background: "rgba(255, 234, 108, 0.15)",
                border: "1px solid var(--palette-yellow)",
                borderRadius: "var(--radius-full)",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--palette-yellow)",
                whiteSpace: "nowrap"
              }}>
                {fairnessScore}% Fair Match
              </div>
            </div>

            {/* Offered Item (From Closet) */}
            <div style={{ textAlign: "center" }}>
              <span className="badge badge-pink" style={{ marginBottom: "8px" }}>Your Offer</span>
              {offeredItem ? (
                <>
                  <div style={{ width: "100%", height: "180px", borderRadius: "var(--radius-md)", overflow: "hidden", margin: "10px 0" }}>
                    <img src={offeredItem.images[0]} alt={offeredItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>{offeredItem.title}</h4>
                  <div style={{ color: "var(--palette-pink-light)", fontWeight: 800 }}>~₹{offeredItem.estimatedValue?.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Your Closet</div>
                </>
              ) : (
                <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", margin: "10px 0", color: "var(--text-muted)", fontSize: "0.85rem", padding: "10px" }}>
                  Select an item below
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Proposal Form */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Select Offered Item */}
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>
              1. Choose Garment From Your Closet to Offer:
            </label>
            {userItems.length === 0 ? (
              <div style={{ padding: "14px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-md)", color: "var(--palette-yellow)", fontSize: "0.9rem" }}>
                Your current profile ({currentUser?.name}) does not have available items listed yet. Switch to another profile or list an item first!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                {userItems.map((ui) => {
                  const isSelected = selectedOfferedId === ui.id;
                  return (
                    <div
                      key={ui.id}
                      onClick={() => setSelectedOfferedId(ui.id)}
                      style={{
                        padding: "10px",
                        borderRadius: "var(--radius-md)",
                        border: isSelected ? "2px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                        background: isSelected ? "rgba(255, 97, 248, 0.12)" : "var(--bg-surface)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <img src={ui.images[0]} alt={ui.title} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ui.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--palette-yellow)" }}>₹{ui.estimatedValue?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fulfillment Method */}
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>
              2. Exchange Handover Method:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div
                onClick={() => {
                  setExchangeType("local_meetup");
                  setLocationProposal("Greenpoint Local Coffee Co.");
                }}
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: exchangeType === "local_meetup" ? "2px solid var(--palette-yellow)" : "1px solid var(--border-subtle)",
                  background: exchangeType === "local_meetup" ? "rgba(255, 234, 108, 0.1)" : "var(--bg-surface)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px", color: "var(--palette-yellow)" }}>
                  <MapPin size={18} /> Local In-Person Meetup
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Zero courier emissions. Hand over clothes directly at a community landmark.
                </div>
              </div>

              <div
                onClick={() => {
                  setExchangeType("courier");
                  setLocationProposal("Standard Tracked Courier Box");
                }}
                style={{
                  padding: "14px",
                  borderRadius: "var(--radius-md)",
                  border: exchangeType === "courier" ? "2px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                  background: exchangeType === "courier" ? "rgba(255, 97, 248, 0.1)" : "var(--bg-surface)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px", color: "var(--palette-pink-light)" }}>
                  <Truck size={18} /> Tracked Courier Shipping
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Ideal for inter-city swaps. Coordinate postal tracking codes in chat.
                </div>
              </div>
            </div>
          </div>

          {/* Location or Shipping Details */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
              {exchangeType === "local_meetup" ? "Proposed Meetup Landmark / Spot" : "Courier Delivery Preference"}
            </label>
            <input
              type="text"
              value={locationProposal}
              onChange={(e) => setLocationProposal(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Personal Note */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px", color: "var(--text-muted)" }}>
              Personal Note / Sizing Discussion:
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !offeredItem}
            style={{ justifyContent: "center", padding: "14px", fontSize: "1.05rem" }}
          >
            {loading ? "Transmitting Proposal..." : "Send Swap Request & Open Negotiation Chat"} &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
