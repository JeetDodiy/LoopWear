import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "user123" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String },
    location: { type: String },
    city: { type: String },
    bio: { type: String },
    sustainabilityScore: {
      itemsSwapped: { type: Number, default: 0 },
      waterSavedLiters: { type: Number, default: 0 },
      co2SavedKg: { type: Number, default: 0 }
    },
    memberSince: { type: String }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
