import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    requesterId: { type: String, required: true },
    requesterName: { type: String },
    requesterAvatar: { type: String },
    targetOwnerId: { type: String, required: true },
    targetOwnerName: { type: String },
    targetItemId: { type: String, required: true },
    targetItemTitle: { type: String },
    targetItemImage: { type: String },
    targetItemValue: { type: Number },
    offeredItemId: { type: String, required: true },
    offeredItemTitle: { type: String },
    offeredItemImage: { type: String },
    offeredItemValue: { type: Number },
    status: {
      type: String,
      enum: ["pending", "negotiating", "accepted", "rejected", "completed"],
      default: "pending"
    },
    fairnessScore: { type: Number },
    exchangeType: {
      type: String,
      enum: ["local_meetup", "courier"],
      default: "local_meetup"
    },
    locationProposal: { type: String },
    note: { type: String }
  },
  { timestamps: true }
);

export const SwapRequest = mongoose.model("SwapRequest", swapRequestSchema);
