import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Tag, 
  RotateCcw, 
  Sparkles,
  Navigation
} from "lucide-react";

export function ListingsPage({ setActivePage, setSelectedItemId }) {
  const { items, refreshItems } = useApp();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [maxDistance, setMaxDistance] = useState(15);
  const [maxValue, setMaxValue] = useState(10000);

  const categories = ["All", "Outerwear", "Bottoms", "Streetwear", "Tops", "Footwear", "Dresses"];
  const conditions = ["All", "Brand New", "Like New", "Gently Used", "Vintage"];

  // Apply filters (newest garments first)
  const sortedItems = [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const filteredItems = sortedItems.filter((item) => {
    if (item.status !== "available") return false;
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    if (selectedCondition !== "All" && item.condition !== selectedCondition) return false;
    if (item.distanceKm > maxDistance) return false;
    if (item.estimatedValue > maxValue) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBrand = item.brand.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchBrand && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedCondition("All");
    setMaxDistance(15);
    setMaxValue(10000);
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper">
        {/* Page Title & Search Bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div>
              <span className="badge badge-pink" style={{ marginBottom: "6px" }}>
                <Navigation size={12} /> Location-Based Swaps
              </span>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>Explore Wardrobes & Clothes</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Filter by distance to discover nearby swappers for zero-shipping local handovers.
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="badge badge-yellow" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
              Showing {filteredItems.length} of {items.filter(i => i.status === "available").length} Available Items
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", maxWidth: "680px" }}>
            <Search size={20} color="var(--text-muted)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by brand (e.g. Patagonia, Carhartt), keyword, or garment type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "48px",
                paddingRight: "16px",
                paddingTop: "14px",
                paddingBottom: "14px",
                fontSize: "1rem",
                borderRadius: "var(--radius-full)"
              }}
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card" style={{ marginBottom: "32px", padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", alignItems: "center" }}>
            {/* Category Dropdown */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                Garment Category
              </label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: "100%" }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Condition Dropdown */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                Condition Rating
              </label>
              <select 
                value={selectedCondition} 
                onChange={(e) => setSelectedCondition(e.target.value)}
                style={{ width: "100%" }}
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Distance Radius */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Max Distance</span>
                <span style={{ color: "var(--palette-yellow)" }}>Within {maxDistance} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={maxDistance} 
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--palette-yellow)", cursor: "pointer" }}
              />
            </div>

            {/* Value Range */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Max Swap Value</span>
                <span style={{ color: "var(--palette-pink-neon)" }}>Up to ₹{maxValue.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="20000" 
                step="500"
                value={maxValue} 
                onChange={(e) => setMaxValue(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--palette-pink-neon)", cursor: "pointer" }}
              />
            </div>

            {/* Reset Button */}
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button 
                className="btn-outline btn-sm"
                onClick={resetFilters}
                style={{ width: "100%", justifyContent: "center", padding: "11px" }}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>No clothing items found matching your filters</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Try expanding your distance radius slider or clearing the category filter.
            </p>
            <button className="btn-secondary" onClick={resetFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
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

                  <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px" }}>
                      Size {item.size}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px" }}>
                      {item.category}
                    </span>
                    {item.tags?.slice(0, 2).map((t) => (
                      <span key={t} style={{ fontSize: "0.75rem", color: "var(--palette-pink-light)", background: "rgba(255, 166, 251, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                        #{t}
                      </span>
                    ))}
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
        )}
      </div>
    </div>
  );
}
