import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Sparkles, 
  ArrowLeftRight, 
  Leaf, 
  Droplet, 
  Scale, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from "lucide-react";

export function LandingPage({ setActivePage, setSelectedItemId, onOpenAddModal }) {
  const { items, currentUser } = useApp();

  const featuredItems = items.filter((i) => i.status === "available").slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: "relative",
        padding: "70px 0 60px 0",
        background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 97, 248, 0.22), rgba(255, 234, 108, 0.1) 40%, transparent 80%)",
        borderBottom: "1px solid var(--border-subtle)"
      }}>
        <div className="content-wrapper" style={{ textAlign: "center", maxWidth: "940px" }}>
          {/* Official Logo Banner */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
            <div style={{
              padding: "6px",
              borderRadius: "26px",
              background: "linear-gradient(135deg, rgba(255, 97, 248, 0.4), rgba(255, 234, 108, 0.4))",
              boxShadow: "0 0 35px rgba(255, 97, 248, 0.35)"
            }}>
              <img 
                src="/logo.png" 
                alt="LoopWear Official Logo" 
                style={{ width: "88px", height: "88px", borderRadius: "20px", display: "block", objectFit: "cover" }} 
              />
            </div>
          </div>

          {/* Tag */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <span className="badge badge-pink">
              <Leaf size={14} /> Zero Fast-Fashion Waste
            </span>
            <span className="badge badge-yellow">
              <Scale size={14} /> 100% Barter Economy
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 5.5vw, 4.2rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "22px",
            letterSpacing: "-0.03em"
          }}>
            Swap Your Clothes. <br />
            <span style={{
              background: "linear-gradient(135deg, var(--palette-pink-neon) 0%, var(--palette-pink-light) 40%, var(--palette-yellow) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Refresh Your Style Sustainably.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
            color: "var(--text-muted)",
            maxWidth: "720px",
            margin: "0 auto 34px auto",
            lineHeight: 1.6
          }}>
            Don't let wearable clothes sit idle in your closet. Exchange pre-loved streetwear, vintage denim, and designer pieces directly with fashion enthusiasts—no cash needed, zero textile waste.
          </p>

          {/* Action CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginBottom: "50px" }}>
            <button 
              className="btn-primary" 
              style={{ fontSize: "1.05rem", padding: "14px 28px" }}
              onClick={() => setActivePage("listings")}
            >
              Explore Available Swaps <ArrowRight size={18} />
            </button>
            <button 
              className="btn-secondary" 
              style={{ fontSize: "1.05rem", padding: "14px 28px" }}
              onClick={onOpenAddModal}
            >
              <Sparkles size={18} /> List an Item to Swap
            </button>
          </div>

          {/* Live Impact Counters */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "18px",
            background: "rgba(20, 23, 33, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "24px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--palette-yellow)", marginBottom: "4px" }}>
                <ArrowLeftRight size={20} />
                <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>850+</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Garments Swapped
              </div>
            </div>

            <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--palette-pink-light)", marginBottom: "4px" }}>
                <Droplet size={20} />
                <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>2.2M Litres</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Clean Water Conserved
              </div>
            </div>

            <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--palette-pink-neon)", marginBottom: "4px" }}>
                <Leaf size={20} />
                <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>5.4 Tonnes</span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                CO₂ Emissions Avoided
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: "80px 0" }}>
        <div className="content-wrapper">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span className="badge badge-cream" style={{ marginBottom: "12px" }}>
              Barter Process
            </span>
            <h2 style={{ fontSize: "2.3rem", fontWeight: 800, marginBottom: "12px" }}>
              How Clothing Swapping Works
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", fontSize: "1rem" }}>
              A frictionless barter cycle designed to make fashion circular, fair, and fun.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
            {/* Step 1 */}
            <div className="glass-card" style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-14px",
                left: "24px",
                background: "var(--palette-yellow)",
                color: "#121316",
                fontWeight: 900,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--glow-yellow)"
              }}>
                1
              </div>
              <h3 style={{ fontSize: "1.3rem", marginTop: "12px", marginBottom: "10px" }}>
                List Your Closet Items
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                Snap a couple of photos, detail the condition, brand, and size. Our system automatically estimates fair trade value.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card" style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-14px",
                left: "24px",
                background: "var(--palette-pink-light)",
                color: "#121316",
                fontWeight: 900,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                2
              </div>
              <h3 style={{ fontSize: "1.3rem", marginTop: "12px", marginBottom: "10px" }}>
                Fair Value Comparison
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                Browse clothes filtered by your city or distance. Our calculator calculates an instant fairness percentage between items.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card" style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-14px",
                left: "24px",
                background: "var(--palette-pink-neon)",
                color: "#FFFFFF",
                fontWeight: 900,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--glow-pink)"
              }}>
                3
              </div>
              <h3 style={{ fontSize: "1.3rem", marginTop: "12px", marginBottom: "10px" }}>
                Chat & Swap Exchange
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                Negotiate directly in real-time chat, agree on a local meetup spot or tracked courier handover, and lock in the swap!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clothing Items */}
      <section style={{ padding: "0 0 80px 0" }}>
        <div className="content-wrapper">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "34px" }}>
            <div>
              <span className="badge badge-pink" style={{ marginBottom: "8px" }}>
                <TrendingUp size={14} /> Freshly Listed
              </span>
              <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>Trending Near You</h2>
            </div>
            <button 
              className="btn-outline btn-sm"
              onClick={() => setActivePage("listings")}
            >
              View All ({items.length}) &rarr;
            </button>
          </div>

          <div className="items-grid">
            {featuredItems.map((item) => (
              <div 
                key={item.id} 
                className="item-card"
                onClick={() => {
                  setSelectedItemId(item.id);
                  setActivePage("item-detail");
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="item-card-image-box">
                  <img src={item.images[0]} alt={item.title} className="item-card-image" />
                  <div className="item-card-value-tag">
                    ~₹{item.estimatedValue?.toLocaleString('en-IN')} Swap Val
                  </div>
                  <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
                    <span className="badge badge-yellow">
                      <MapPin size={12} /> {item.distanceKm} km away
                    </span>
                  </div>
                </div>

                <div className="item-card-body">
                  <div className="item-card-meta">
                    <span className="item-card-brand">{item.brand}</span>
                    <span className="badge badge-cream" style={{ fontSize: "0.72rem" }}>
                      {item.condition}
                    </span>
                  </div>

                  <h3 className="item-card-title">{item.title}</h3>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px" }}>
                      Size: <strong>{item.size}</strong>
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px" }}>
                      Category: <strong>{item.category}</strong>
                    </span>
                  </div>

                  <div className="item-card-footer">
                    <div className="owner-chip">
                      <img src={item.ownerAvatar} alt={item.ownerName} className="owner-avatar-sm" />
                      <span>{item.ownerName}</span>
                    </div>
                    <span style={{ color: "var(--palette-pink-neon)", fontSize: "0.85rem", fontWeight: 700 }}>
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
