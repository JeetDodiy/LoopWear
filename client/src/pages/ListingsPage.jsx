import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, 
  MapPin, 
  RotateCcw, 
  Sparkles,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  ArrowUpDown
} from "lucide-react";

export function ListingsPage({ setActivePage, setSelectedItemId }) {
  const { items, refreshItems } = useApp();
  const sliderRef = useRef(null);

  // Auto-refresh items from server on mount to ensure newly added garments are immediately visible
  useEffect(() => {
    refreshItems();
  }, []);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [maxDistance, setMaxDistance] = useState(25);
  // Default to 100,000 so newly listed items with high values (e.g. ₹25,000, ₹30,000) are never hidden
  const [maxValue, setMaxValue] = useState(100000);
  const [ageFilter, setAgeFilter] = useState("all"); // 'all' | 'new' | 'classic'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'value_high' | 'value_low' | 'distance'

  const categories = ["All", "Outerwear", "Bottoms", "Streetwear", "Tops", "Footwear", "Dresses"];
  const conditions = ["All", "Brand New", "Like New", "Gently Used", "Vintage"];

  // Helper: Detect if garment is newly added (user created or recent)
  const isNewItem = (item) => {
    if (item.id && String(item.id).startsWith("itm_")) return true;
    if (item.createdAt) {
      const itemDate = new Date(item.createdAt).getTime();
      const now = new Date().getTime();
      return (now - itemDate) < 14 * 24 * 60 * 60 * 1000;
    }
    return false;
  };

  // Horizontal slider scroll handler
  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Calculate counts for quick segmented filter
  const availableItems = items.filter((i) => i.status === "available");
  const newItemsCount = availableItems.filter(isNewItem).length;
  const classicItemsCount = availableItems.length - newItemsCount;

  // 1. Sort items
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    if (sortBy === "value_high") {
      return (b.estimatedValue || 0) - (a.estimatedValue || 0);
    }
    if (sortBy === "value_low") {
      return (a.estimatedValue || 0) - (b.estimatedValue || 0);
    }
    if (sortBy === "distance") {
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    }
    return 0;
  });

  // 2. Filter items
  const filteredItems = sortedItems.filter((item) => {
    if (item.status !== "available") return false;
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    if (selectedCondition !== "All" && item.condition !== selectedCondition) return false;
    if (item.distanceKm > maxDistance) return false;
    if (item.estimatedValue > maxValue) return false;

    // Recency / Age filter
    if (ageFilter === "new" && !isNewItem(item)) return false;
    if (ageFilter === "classic" && isNewItem(item)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchBrand && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedCondition("All");
    setMaxDistance(25);
    setMaxValue(100000);
    setAgeFilter("all");
    setSortBy("newest");
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper">
        {/* Page Title & Search Bar */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div>
              <span className="badge badge-pink" style={{ marginBottom: "6px" }}>
                <Navigation size={12} /> Location-Based Swaps
              </span>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>Explore Wardrobes & Clothes</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Filter by distance and value to discover nearby swappers for zero-shipping local handovers.
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="badge badge-yellow" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
              Showing {filteredItems.length} of {availableItems.length} Available Items
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", maxWidth: "680px" }}>
            <Search size={20} color="var(--text-muted)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by brand (e.g. Google, Gucci, Patagonia), keyword, or garment type..."
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

        {/* Interactive Clothing Carousel / Slider (Allows user to slide through new and old items) */}
        <div className="slider-container glass-card" style={{ padding: "20px", marginBottom: "32px" }}>
          <div className="slider-header">
            <div>
              <span className="badge badge-pink" style={{ marginBottom: "6px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={12} /> Clothes Slider
              </span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                Slide to Check New & Classic Garments
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "4px 0 0 0" }}>
                Swipe or click arrow buttons to explore all newly added and classic items side-by-side.
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button 
                type="button"
                className="slider-nav-btn" 
                onClick={() => scrollSlider("left")} 
                title="Slide Left"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                type="button"
                className="slider-nav-btn" 
                onClick={() => scrollSlider("right")} 
                title="Slide Right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="slider-track" ref={sliderRef}>
            {availableItems.map((item) => {
              const isNew = isNewItem(item);
              return (
                <div 
                  key={`slide-${item.id}`} 
                  className="item-card slider-card"
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setActivePage("item-detail");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="item-card-image-box" style={{ height: "190px" }}>
                    <img src={item.images[0]} alt={item.title} className="item-card-image" />
                    <div className="item-card-value-tag">
                      ~₹{item.estimatedValue?.toLocaleString('en-IN')}
                    </div>
                    
                    <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                      {isNew ? (
                        <span className="badge-new-arrival">
                          <Flame size={11} /> New
                        </span>
                      ) : (
                        <span className="badge-classic">
                          <Clock size={11} /> Classic
                        </span>
                      )}
                    </div>

                    <div style={{ position: "absolute", bottom: "10px", left: "10px" }}>
                      <span className="badge badge-yellow" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                        <MapPin size={10} /> {item.distanceKm} km away
                      </span>
                    </div>
                  </div>

                  <div className="item-card-body" style={{ padding: "14px" }}>
                    <div className="item-card-meta">
                      <span className="item-card-brand">{item.brand}</span>
                      <span className="badge badge-cream" style={{ fontSize: "0.7rem" }}>
                        {item.condition}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </h4>

                    <div className="item-card-footer" style={{ paddingTop: "10px" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Size: {item.size}</span>
                      <span style={{ color: "var(--palette-pink-neon)", fontSize: "0.82rem", fontWeight: 700 }}>
                        Inspect &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card" style={{ marginBottom: "28px", padding: "20px" }}>
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
                max="50" 
                value={maxDistance} 
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--palette-yellow)", cursor: "pointer" }}
              />
            </div>

            {/* Value Range (Expanded to ₹1,00,000 so all items show by default) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Max Swap Value</span>
                <span style={{ color: "var(--palette-pink-neon)" }}>
                  {maxValue >= 100000 ? "All Values (Up to ₹1L+)" : `Up to ₹${maxValue.toLocaleString('en-IN')}`}
                </span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="100000" 
                step="1000"
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
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Segmented Filter & Sort Options */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          {/* New vs Old Segmented Slider Switch */}
          <div className="segmented-slider">
            <button 
              type="button"
              className={`segmented-slider-btn ${ageFilter === "all" ? "active" : ""}`}
              onClick={() => setAgeFilter("all")}
            >
              <Sparkles size={14} /> All Clothes ({availableItems.length})
            </button>
            <button 
              type="button"
              className={`segmented-slider-btn ${ageFilter === "new" ? "active" : ""}`}
              onClick={() => setAgeFilter("new")}
            >
              <Flame size={14} /> New Arrivals ({newItemsCount})
            </button>
            <button 
              type="button"
              className={`segmented-slider-btn ${ageFilter === "classic" ? "active" : ""}`}
              onClick={() => setAgeFilter("classic")}
            >
              <Clock size={14} /> Classic Archive ({classicItemsCount})
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>Sort By:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "8px 14px", fontSize: "0.85rem", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.06)" }}
            >
              <option value="newest">✨ Newest Added First</option>
              <option value="oldest">⏳ Oldest Added First</option>
              <option value="value_high">💎 Value: High to Low</option>
              <option value="value_low">🏷️ Value: Low to High</option>
              <option value="distance">📍 Distance: Nearest First</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>No clothing items found matching your filters</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Try moving the Max Swap Value slider to the right or clicking Reset Filters.
            </p>
            <button className="btn-secondary" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => {
              const isNew = isNewItem(item);
              return (
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

                    <div style={{ position: "absolute", top: "14px", left: "14px" }}>
                      {isNew ? (
                        <span className="badge-new-arrival">
                          <Flame size={12} /> New Arrival
                        </span>
                      ) : (
                        <span className="badge-classic">
                          <Clock size={12} /> Classic
                        </span>
                      )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
