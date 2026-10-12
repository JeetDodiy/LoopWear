import mongoose from "mongoose";

const clothingItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    size: { type: String, required: true },
    gender: { type: String, default: "Unisex" },
    condition: { type: String, required: true },
    conditionRating: { type: Number, default: 4.5 },
    estimatedValue: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    location: { type: String },
    distanceKm: { type: Number, default: 1.0 },
    ownerId: { type: String, required: true },
    ownerName: { type: String },
    ownerAvatar: { type: String },
    status: {
      type: String,
      enum: ["available", "in_negotiation", "swapped", "removed_by_admin"],
      default: "available"
    },
    tags: [{ type: String }],
    impactWaterSavedLiters: { type: Number, default: 2500 },
    impactCo2SavedKg: { type: Number, default: 6.5 }
  },
  { timestamps: true }
);

export const ClothingItem = mongoose.model("ClothingItem", clothingItemSchema);
