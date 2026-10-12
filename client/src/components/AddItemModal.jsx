import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { createItem } from "../services/api";
import { 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Sparkles, 
  Trash2, 
  CheckCircle2 
} from "lucide-react";

export function AddItemModal({ isOpen, onClose, setActivePage }) {
  const { currentUser, refreshItems } = useApp();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Outerwear");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("M");
  const [condition, setCondition] = useState("Gently Used");
  const [estimatedValue, setEstimatedValue] = useState(2500);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSourceMode, setImageSourceMode] = useState("upload"); // 'upload' | 'preset' | 'url'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Preset curated realistic clothing images
  const sampleImages = [
    { label: "Denim / Jeans", url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80" },
    { label: "Jacket / Outerwear", url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80" },
    { label: "Sweatshirt / Hoodie", url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80" },
    { label: "Boots / Shoes", url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80" },
    { label: "Dress / Silk", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80" }
  ];

  // Helper: Resize and convert file to Base64 data URL
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to max 1200px width/height for optimal loading & storage
        const maxDim = 1200;
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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        setImageUrl(dataUrl);
        setError("");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !brand || !category) {
      setError("Please fill in Title, Brand, and Category.");
      return;
    }
    if (!imageUrl) {
      setError("Please upload an image from your device or pick a style photo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createItem({
        title,
        category,
        brand,
        size,
        condition,
        estimatedValue: Number(estimatedValue),
        description: description || `Pre-loved ${brand} ${category} in ${condition} condition.`,
        images: [imageUrl],
        ownerId: currentUser.id,
        location: currentUser.city || "Brooklyn, NY"
      });

      await refreshItems();
      onClose();
      if (setActivePage) setActivePage("dashboard");
    } catch (err) {
      setError(err.message || "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: "4px" }}>Wardrobe Intake</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>List an Item to Swap</h2>
          </div>
          <button 
            className="btn-outline btn-sm" 
            onClick={onClose} 
            style={{ borderRadius: "50%", width: "36px", height: "36px", padding: 0, justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(255, 75, 75, 0.15)", border: "1px solid #ff4b4b", padding: "12px", borderRadius: "var(--radius-sm)", color: "#ff8b8b", marginBottom: "16px", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Garment Title</label>
            <input
              type="text"
              placeholder="e.g. Vintage Carhartt Heavyweight Canvas Jacket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Brand</label>
              <input
                type="text"
                placeholder="e.g. Carhartt, Levi's, Patagonia"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
                <option value="Outerwear">Outerwear</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Tops">Tops</option>
                <option value="Footwear">Footwear</option>
                <option value="Dresses">Dresses</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Size</label>
              <input
                type="text"
                placeholder="e.g. M, L, 32"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ width: "100%" }}>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Gently Used">Gently Used</option>
                <option value="Vintage">Vintage</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Est. Swap Value (₹)</label>
              <input
                type="number"
                min="200"
                max="50000"
                step="100"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Image Selection Area with Device Upload */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                Garment Photo
              </label>

              {/* Source Mode Switcher */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setImageSourceMode("upload")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: imageSourceMode === "upload" ? "var(--palette-pink-neon)" : "rgba(255,255,255,0.08)",
                    color: imageSourceMode === "upload" ? "#fff" : "var(--text-muted)"
                  }}
                >
                  From Device
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode("preset")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: imageSourceMode === "preset" ? "var(--palette-pink-neon)" : "rgba(255,255,255,0.08)",
                    color: imageSourceMode === "preset" ? "#fff" : "var(--text-muted)"
                  }}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode("url")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: imageSourceMode === "url" ? "var(--palette-pink-neon)" : "rgba(255,255,255,0.08)",
                    color: imageSourceMode === "url" ? "#fff" : "var(--text-muted)"
                  }}
                >
                  Web URL
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Mode 1: Device Upload (Drag & Drop or Click to Browse) */}
            {imageSourceMode === "upload" && (
              <div>
                {imageUrl ? (
                  /* Preview with remove button */
                  <div style={{
                    position: "relative",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: "2px solid var(--palette-pink-neon)",
                    height: "180px",
                    background: "#0c0e14"
                  }}>
                    <img 
                      src={imageUrl} 
                      alt="Uploaded Preview" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      padding: "12px"
                    }}>
                      <span style={{ fontSize: "0.78rem", color: "#2ed573", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}>
                        <CheckCircle2 size={14} /> Photo Ready
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          style={{ padding: "4px 10px", fontSize: "0.75rem", background: "rgba(0,0,0,0.6)" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          style={{ padding: "4px 10px", fontSize: "0.75rem", color: "#ff8b8b", background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,75,75,0.4)" }}
                          onClick={() => setImageUrl("")}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragActive ? "var(--palette-pink-neon)" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "28px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: dragActive ? "rgba(255, 97, 248, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(255, 97, 248, 0.15)",
                      color: "var(--palette-pink-neon)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px auto"
                    }}>
                      <UploadCloud size={24} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px" }}>
                      Click to choose photo from your computer
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      or drag and drop your image file here (PNG, JPG, WEBP)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Presets */}
            {imageSourceMode === "preset" && (
              <div>
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
                  {sampleImages.map((s, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setImageUrl(s.url)}
                      style={{
                        padding: "6px",
                        borderRadius: "var(--radius-sm)",
                        border: imageUrl === s.url ? "2px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                        background: imageUrl === s.url ? "rgba(255, 97, 248, 0.12)" : "transparent",
                        textAlign: "center",
                        flexShrink: 0
                      }}
                    >
                      <img src={s.url} alt={s.label} style={{ width: "60px", height: "60px", borderRadius: "4px", objectFit: "cover", display: "block" }} />
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 3: Web URL */}
            {imageSourceMode === "url" && (
              <div>
                <input
                  type="text"
                  placeholder="Paste direct image link (https://...)..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>Description & Measurements</label>
            <textarea
              rows={3}
              placeholder="Provide fabric details, fit notes, flaws (if any), and what pieces you're interested in swapping for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ justifyContent: "center", padding: "12px", marginTop: "8px" }}
          >
            {loading ? "Publishing to Marketplace & MongoDB..." : "Publish Garment to Marketplace"}
          </button>
        </form>
      </div>
    </div>
  );
}
