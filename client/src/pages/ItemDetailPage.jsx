import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { evaluateSwapValue } from "../services/api";
import { 
  ArrowLeft, 
  MapPin, 
  Droplet, 
  Leaf, 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeftRight, 
  ShieldCheck, 
  User 
} from "lucide-react";

export function ItemDetailPage({ itemId, setActivePage, setSelectedItemId }) {
  const { items, currentUser } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Calculator State
  const [selectedUserItem, setSelectedUserItem] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const item = items.find((i) => i.id === itemId) || items[0];

  // User's available items to offer for swapping
  const userItems = items.filter(
    (i) => i.ownerId === currentUser?.id && i.id !== item?.id && i.status === "available"
  );

  // Set default calculator comparison item if user has any
  useEffect(() => {
    if (userItems.length > 0 && !selectedUserItem) {
      setSelectedUserItem(userItems[0]);
    }
  }, [userItems]);

  // Run calculation when comparison item changes
  useEffect(() => {
    if (selectedUserItem && item) {
      setEvaluating(true);
      evaluateSwapValue(item, selectedUserItem)
        .then((res) => {
          setCalcResult(res);
        })
        .finally(() => setEvaluating(false));
    }
  }, [selectedUserItem, item]);

  if (!item) {
    return (
      <div className="content-wrapper" style={{ padding: "60px 0", textAlign: "center" }}>
        <h2>Item not found</h2>
        <button className="btn-primary" onClick={() => setActivePage("listings")}>
          Return to Listings
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === item.ownerId;

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper">
        {/* Back navigation */}
        <button 
          className="btn-outline btn-sm" 
          onClick={() => setActivePage("listings")}
          style={{ marginBottom: "24px" }}
        >
          <ArrowLeft size={16} /> Back to Browse
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "40px", alignItems: "start" }}>
          {/* Left Column: Image Showcase */}
          <div>
            <div style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--border-subtle)",
              background: "#0d0f16",
              height: "440px",
              marginBottom: "16px",
              boxShadow: "var(--shadow-card)"
            }}>
              <img 
                src={item.images[activeImageIndex] || item.images[0]} 
                alt={item.title} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>

            {/* Thumbnails */}
            {item.images.length > 1 && (
              <div style={{ display: "flex", gap: "12px" }}>
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      border: activeImageIndex === idx ? "2px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                      padding: 0,
                      background: "transparent"
                    }}
                  >
                    <img src={img} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Sustainability Impact Callout */}
            <div className="glass-card" style={{ marginTop: "24px", borderColor: "rgba(255, 234, 108, 0.3)", background: "rgba(255, 234, 108, 0.04)" }}>
              <h4 style={{ fontSize: "1rem", color: "var(--palette-yellow)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Leaf size={18} /> Verified Ecological Impact
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "14px" }}>
                Swapping this garment instead of buying new avoids virgin production demand:
              </p>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                  <div style={{ color: "var(--palette-pink-light)", fontWeight: 800, fontSize: "1.2rem" }}>
                    {item.impactWaterSavedLiters || 2700} L
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Water Conserved</div>
                </div>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                  <div style={{ color: "var(--palette-yellow)", fontWeight: 800, fontSize: "1.2rem" }}>
                    {item.impactCo2SavedKg || 6.5} kg
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>CO₂ Avoided</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Garment Specs & Swap Action */}
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <span className="badge badge-pink">{item.category}</span>
              <span className="badge badge-yellow">{item.condition}</span>
              <span className="badge badge-cream">Size {item.size}</span>
            </div>

            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "14px" }}>
              {item.title}
            </h1>

            {/* Estimated Value & Distance */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: "rgba(255, 97, 248, 0.08)",
              border: "1px solid rgba(255, 97, 248, 0.25)",
              borderRadius: "var(--radius-md)",
              marginBottom: "24px"
            }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Estimated Fair Swap Value
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--palette-yellow)" }}>
                  ${item.estimatedValue} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>USD</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontWeight: 700 }}>
                  <MapPin size={16} color="var(--palette-pink-light)" /> {item.distanceKm} km away
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.location}</div>
              </div>
            </div>

            {/* Garment Description */}
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "8px" }}>Item Details & Provenance</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {item.description}
              </p>
            </div>

            {/* Owner Profile Card */}
            <div className="glass-card" style={{ marginBottom: "28px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img 
                    src={item.ownerAvatar} 
                    alt={item.ownerName} 
                    style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover" }} 
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{item.ownerName}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{item.location}</div>
                  </div>
                </div>
                <span className="badge badge-green">
                  <ShieldCheck size={14} /> Verified Swapper
                </span>
              </div>
            </div>

            {/* Swap Value Calculator Module */}
            <div className="glass-card" style={{ marginBottom: "28px", borderColor: "var(--border-yellow)", background: "rgba(255, 234, 108, 0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Scale size={18} color="var(--palette-yellow)" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Instant Swap Value Calculator</h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Select an item from your closet to preview fair-trade balance before sending a proposal:
              </p>

              {userItems.length === 0 ? (
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  You don't have available clothes in your closet to compare yet. Add an item or switch to another demo profile!
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Compare against your item:
                  </label>
                  <select 
                    value={selectedUserItem?.id || ""} 
                    onChange={(e) => {
                      const matched = userItems.find((ui) => ui.id === e.target.value);
                      setSelectedUserItem(matched);
                    }}
                    style={{ width: "100%", marginBottom: "16px" }}
                  >
                    {userItems.map((ui) => (
                      <option key={ui.id} value={ui.id}>
                        {ui.title} (~${ui.estimatedValue})
                      </option>
                    ))}
                  </select>

                  {calcResult && (
                    <div style={{ background: "rgba(0,0,0,0.35)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Fairness Score:</span>
                        <span style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: calcResult.fairnessPercentage >= 80 ? "#2ed573" : "var(--palette-yellow)"
                        }}>
                          {calcResult.fairnessPercentage}% Fair Match
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
                        <div style={{
                          width: `${calcResult.fairnessPercentage}%`,
                          height: "100%",
                          background: "var(--gradient-brand)",
                          borderRadius: "4px",
                          transition: "width 0.4s ease"
                        }} />
                      </div>

                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {calcResult.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            {isOwner ? (
              <div style={{ padding: "14px", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                <span style={{ color: "var(--palette-yellow)", fontWeight: 700 }}>This is your listing.</span> You can manage it from your Dashboard.
              </div>
            ) : (
              <div style={{ display: "flex", gap: "14px" }}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: "center", fontSize: "1.05rem", padding: "14px" }}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setActivePage("swap-request");
                  }}
                >
                  <ArrowLeftRight size={18} /> Initiate Swap Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
