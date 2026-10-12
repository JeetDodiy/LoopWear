import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    swapId: { type: String, required: true },
    reportedBy: { type: String, required: true },
    reporterName: { type: String },
    targetUser: { type: String },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["under_review", "investigating", "resolved"],
      default: "under_review"
    },
    resolutionNotes: { type: String }
  },
  { timestamps: true }
);

export const Dispute = mongoose.model("Dispute", disputeSchema);
