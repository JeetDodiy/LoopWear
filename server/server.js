import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  initialUsers,
  initialClothingItems,
  initialSwapRequests,
  initialChatMessages,
  initialDisputes
} from "./data/seedData.js";
import { User } from "./models/User.js";
import { ClothingItem } from "./models/ClothingItem.js";
import { SwapRequest } from "./models/SwapRequest.js";
import { ChatMessage } from "./models/ChatMessage.js";
import { Dispute } from "./models/Dispute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// In-memory fallback state (seeded with realistic fashion data)
let users = [...initialUsers];
let items = [...initialClothingItems];
let swapRequests = [...initialSwapRequests];
let chatMessages = [...initialChatMessages];
let disputes = [...initialDisputes];
let isMongoConnected = false;

// Prevent process termination on transient socket warnings
process.on("unhandledRejection", (reason) => {
  console.warn("Handled socket/promise warning:", reason?.message || reason);
});

mongoose.connection.on("error", (err) => {
  console.warn("MongoDB connection warning:", err.message);
  isMongoConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection paused. Server continuing in seamless mode.");
  isMongoConnected = false;
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection active.");
  isMongoConnected = true;
});

// Connect to MongoDB if URI is supplied
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, { 
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })
    .then(async () => {
      isMongoConnected = true;
      console.log("Connected to MongoDB via Mongoose successfully!");

      // Auto-seed MongoDB collections if empty
      try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log("Seeding MongoDB with realistic initial fashion data...");
          await User.insertMany(initialUsers);
          await ClothingItem.insertMany(initialClothingItems);
          await SwapRequest.insertMany(initialSwapRequests);
          await ChatMessage.insertMany(initialChatMessages);
          await Dispute.insertMany(initialDisputes);
          console.log("MongoDB seeded successfully!");
        }
      } catch (seedErr) {
        console.warn("Seeding check warning:", seedErr.message);
      }
    })
    .catch((err) => {
      console.warn("Initial MongoDB connection notice:", err.message);
      console.log("Operating with built-in instant database engine.");
      isMongoConnected = false;
    });
} else {
  console.log("Running in development mode with built-in persistent store. (Set MONGODB_URI in server/.env to attach MongoDB)");
}

// Brand Tier Multipliers for Swap Value Estimation
function calculateFairness(valA, valB) {
  if (!valA || !valB) return 80;
  const ratio = Math.min(valA, valB) / Math.max(valA, valB);
  return Math.round(ratio * 100);
}

// ----------------- ROUTES -----------------

// Health & DB Connection Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: isMongoConnected ? "MongoDB (Connected)" : "Local Persistent Memory Store",
    mongoUriConfigured: !!MONGODB_URI,
    itemsCount: isMongoConnected ? "live_in_mongo" : items.length,
    usersCount: isMongoConnected ? "live_in_mongo" : users.length,
    swapsCount: isMongoConnected ? "live_in_mongo" : swapRequests.length
  });
});

// Auth & Users
app.get("/api/users", async (req, res) => {
  if (isMongoConnected) {
    const dbUsers = await User.find({});
    return res.json(dbUsers);
  }
  res.json(users);
});

app.get("/api/users/:id", async (req, res) => {
  if (isMongoConnected) {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  }
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.post("/api/auth/login", async (req, res) => {
  const { email, userId } = req.body;
  if (isMongoConnected) {
    let user;
    if (userId) {
      user = await User.findOne({ id: userId });
    } else {
      user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
    }
    if (!user) return res.status(401).json({ error: "Invalid credentials." });
    return res.json({ user, token: "jwt_" + user.id });
  }

  if (userId) {
    const user = users.find((u) => u.id === userId);
    if (user) return res.json({ user, token: "mock_jwt_token_" + user.id });
  }
  const user = users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. Try switching to a demo profile." });
  }
  res.json({ user, token: "mock_jwt_token_" + user.id });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, city, bio } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newUser = {
    id: "usr_" + Date.now(),
    name,
    email,
    role: "user",
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
    location: city ? `${city} (0.5 km away)` : "Greenpoint, Brooklyn (0.5 km away)",
    city: city || "Brooklyn, NY",
    bio: bio || "Sustainable fashion swap advocate.",
    sustainabilityScore: {
      itemsSwapped: 0,
      waterSavedLiters: 0,
      co2SavedKg: 0
    },
    memberSince: new Date().toISOString().split("T")[0]
  };

  if (isMongoConnected) {
    await User.create(newUser);
    return res.status(201).json({ user: newUser, token: "jwt_" + newUser.id });
  }

  users.push(newUser);
  res.status(201).json({ user: newUser, token: "mock_jwt_token_" + newUser.id });
});

// Clothing Listings
app.get("/api/items", async (req, res) => {
  const { search, category, brand, condition, maxDistance, maxValue, ownerId, status } = req.query;

  if (isMongoConnected) {
    const filter = {};
    if (status) filter.status = status;
    if (ownerId) filter.ownerId = ownerId;
    if (category && category !== "All") filter.category = category;
    if (condition && condition !== "All") filter.condition = condition;
    if (brand && brand !== "All") filter.brand = new RegExp(brand, "i");
    if (maxValue) filter.estimatedValue = { $lte: Number(maxValue) };
    if (maxDistance) filter.distanceKm = { $lte: Number(maxDistance) };
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { description: new RegExp(search, "i") }
      ];
    }
    const dbItems = await ClothingItem.find(filter).sort({ createdAt: -1 });
    return res.json(dbItems);
  }

  let filtered = [...items];
  if (status) filtered = filtered.filter((i) => i.status === status);
  if (ownerId) filtered = filtered.filter((i) => i.ownerId === ownerId);
  if (category && category !== "All") filtered = filtered.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  if (condition && condition !== "All") filtered = filtered.filter((i) => i.condition.toLowerCase() === condition.toLowerCase());
  if (brand && brand !== "All") filtered = filtered.filter((i) => i.brand.toLowerCase().includes(brand.toLowerCase()));
  if (maxValue) filtered = filtered.filter((i) => i.estimatedValue <= Number(maxValue));
  if (maxDistance) filtered = filtered.filter((i) => i.distanceKm <= Number(maxDistance));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.tags && i.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  res.json(filtered);
});

app.get("/api/items/:id", async (req, res) => {
  if (isMongoConnected) {
    const item = await ClothingItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: "Item not found" });
    return res.json(item);
  }
  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

app.post("/api/items", async (req, res) => {
  const {
    title,
    category,
    brand,
    size,
    gender,
    condition,
    estimatedValue,
    description,
    images,
    location,
    ownerId,
    tags
  } = req.body;

  if (!title || !category || !brand || !size || !ownerId) {
    return res.status(400).json({ error: "Missing required fields for listing." });
  }

  const owner = isMongoConnected
    ? await User.findOne({ id: ownerId })
    : users.find((u) => u.id === ownerId) || users[0];

  const newItem = {
    id: "item_" + Date.now(),
    title,
    category,
    brand,
    size,
    gender: gender || "Unisex",
    condition: condition || "Gently Used",
    conditionRating: condition === "Brand New" ? 5.0 : condition === "Like New" ? 4.8 : 4.3,
    estimatedValue: Number(estimatedValue) || 90,
    description: description || "Pre-loved sustainable fashion piece ready for a new home.",
    images: images && images.length > 0 ? images : [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80"
    ],
    location: location || owner?.city || "Brooklyn, NY",
    distanceKm: 0.8,
    ownerId: owner?.id || ownerId,
    ownerName: owner?.name || "Community Member",
    ownerAvatar: owner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: new Date().toISOString(),
    tags: tags || ["preloved", category.toLowerCase()],
    impactWaterSavedLiters: 2500,
    impactCo2SavedKg: 6.2
  };

  if (isMongoConnected) {
    await ClothingItem.create(newItem);
    return res.status(201).json(newItem);
  }

  items.unshift(newItem);
  res.status(201).json(newItem);
});

app.delete("/api/items/:id", async (req, res) => {
  if (isMongoConnected) {
    await ClothingItem.deleteOne({ id: req.params.id });
    return res.json({ message: "Item removed successfully" });
  }
  const index = items.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Item not found" });
  const removed = items.splice(index, 1)[0];
  res.json({ message: "Item removed successfully", item: removed });
});

// Swap Requests
app.get("/api/swaps", async (req, res) => {
  const { userId } = req.query;
  if (isMongoConnected) {
    const filter = userId
      ? { $or: [{ requesterId: userId }, { targetOwnerId: userId }] }
      : {};
    const dbSwaps = await SwapRequest.find(filter).sort({ createdAt: -1 });
    return res.json(dbSwaps);
  }

  let results = [...swapRequests];
  if (userId) {
    results = results.filter((s) => s.requesterId === userId || s.targetOwnerId === userId);
  }
  res.json(results);
});

app.post("/api/swaps", async (req, res) => {
  const {
    requesterId,
    targetItemId,
    offeredItemId,
    exchangeType,
    locationProposal,
    note
  } = req.body;

  const requester = isMongoConnected
    ? await User.findOne({ id: requesterId })
    : users.find((u) => u.id === requesterId);

  const targetItem = isMongoConnected
    ? await ClothingItem.findOne({ id: targetItemId })
    : items.find((i) => i.id === targetItemId);

  const offeredItem = isMongoConnected
    ? await ClothingItem.findOne({ id: offeredItemId })
    : items.find((i) => i.id === offeredItemId);

  if (!requester || !targetItem || !offeredItem) {
    return res.status(400).json({ error: "Invalid swap request data or items not found." });
  }

  const fairness = calculateFairness(targetItem.estimatedValue, offeredItem.estimatedValue);

  const newSwap = {
    id: "swap_" + Date.now(),
    requesterId: requester.id,
    requesterName: requester.name,
    requesterAvatar: requester.avatar,
    targetOwnerId: targetItem.ownerId,
    targetOwnerName: targetItem.ownerName,
    targetItemId: targetItem.id,
    targetItemTitle: targetItem.title,
    targetItemImage: targetItem.images[0],
    targetItemValue: targetItem.estimatedValue,
    offeredItemId: offeredItem.id,
    offeredItemTitle: offeredItem.title,
    offeredItemImage: offeredItem.images[0],
    offeredItemValue: offeredItem.estimatedValue,
    status: "pending",
    fairnessScore: fairness,
    exchangeType: exchangeType || "local_meetup",
    locationProposal: locationProposal || "Local community drop-off point",
    note: note || "Hi! I would love to swap my item for yours.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const initialMsg = {
    id: "msg_" + Date.now(),
    swapId: newSwap.id,
    senderId: requester.id,
    senderName: requester.name,
    text: `Proposal created: "${offeredItem.title}" for "${targetItem.title}". Note: ${newSwap.note}`,
    timestamp: new Date().toISOString()
  };

  if (isMongoConnected) {
    await SwapRequest.create(newSwap);
    await ChatMessage.create(initialMsg);
    return res.status(201).json(newSwap);
  }

  swapRequests.unshift(newSwap);
  chatMessages.push(initialMsg);
  res.status(201).json(newSwap);
});

app.put("/api/swaps/:id/status", async (req, res) => {
  const { status } = req.body;
  if (isMongoConnected) {
    const swap = await SwapRequest.findOneAndUpdate(
      { id: req.params.id },
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!swap) return res.status(404).json({ error: "Swap request not found" });
    return res.json(swap);
  }

  const swap = swapRequests.find((s) => s.id === req.params.id);
  if (!swap) return res.status(404).json({ error: "Swap request not found" });
  swap.status = status;
  swap.updatedAt = new Date().toISOString();
  res.json(swap);
});

// Chats
app.get("/api/chats/:swapId", async (req, res) => {
  if (isMongoConnected) {
    const msgs = await ChatMessage.find({ swapId: req.params.swapId }).sort({ timestamp: 1 });
    return res.json(msgs);
  }
  const msgs = chatMessages.filter((m) => m.swapId === req.params.swapId);
  res.json(msgs);
});

app.post("/api/chats/:swapId", async (req, res) => {
  const { senderId, text } = req.body;
  if (!text) return res.status(400).json({ error: "Message text is required" });

  const sender = isMongoConnected
    ? await User.findOne({ id: senderId })
    : users.find((u) => u.id === senderId);

  const newMsg = {
    id: "msg_" + Date.now(),
    swapId: req.params.swapId,
    senderId,
    senderName: sender ? sender.name : "Community Member",
    text,
    timestamp: new Date().toISOString()
  };

  if (isMongoConnected) {
    await ChatMessage.create(newMsg);
    return res.status(201).json(newMsg);
  }

  chatMessages.push(newMsg);
  res.status(201).json(newMsg);
});

// Calculator
app.post("/api/calculator/evaluate", (req, res) => {
  const { itemA, itemB } = req.body;
  const valA = Number(itemA?.estimatedValue || 100);
  const valB = Number(itemB?.estimatedValue || 100);
  const fairness = calculateFairness(valA, valB);

  let recommendation = "Equal fair value exchange!";
  if (fairness < 70) {
    recommendation = valA > valB
      ? "Significant value gap. Consider offering an additional accessory to balance the trade."
      : "You are offering an item with significantly higher estimated value.";
  } else if (fairness < 85) {
    recommendation = "Reasonable swap match with minor variance. Good for mutual negotiation.";
  }

  res.json({
    itemAValue: valA,
    itemBValue: valB,
    fairnessPercentage: fairness,
    difference: Math.abs(valA - valB),
    recommendation
  });
});

// Admin Panel
app.get("/api/admin/overview", async (req, res) => {
  if (isMongoConnected) {
    const allItems = await ClothingItem.find({});
    const allUsers = await User.find({});
    const allSwaps = await SwapRequest.find({});
    const allDisputes = await Dispute.find({});

    const totalWaterSaved = allUsers.reduce((acc, u) => acc + (u.sustainabilityScore?.waterSavedLiters || 0), 0);
    const totalCo2Saved = allUsers.reduce((acc, u) => acc + (u.sustainabilityScore?.co2SavedKg || 0), 0);

    return res.json({
      kpis: {
        totalListings: allItems.length,
        availableListings: allItems.filter((i) => i.status === "available").length,
        activeUsers: allUsers.length,
        totalSwaps: allSwaps.length,
        successfulSwaps: allSwaps.filter((s) => s.status === "completed" || s.status === "accepted").length,
        openDisputes: allDisputes.filter((d) => d.status === "under_review").length,
        totalWaterSavedLiters: totalWaterSaved,
        totalCo2SavedKg: Math.round(totalCo2Saved)
      },
      items: allItems,
      users: allUsers,
      swaps: allSwaps,
      disputes: allDisputes
    });
  }

  const totalWaterSaved = users.reduce((acc, u) => acc + (u.sustainabilityScore?.waterSavedLiters || 0), 0);
  const totalCo2Saved = users.reduce((acc, u) => acc + (u.sustainabilityScore?.co2SavedKg || 0), 0);
  const successfulSwaps = swapRequests.filter((s) => s.status === "completed" || s.status === "accepted").length;

  res.json({
    kpis: {
      totalListings: items.length,
      availableListings: items.filter((i) => i.status === "available").length,
      activeUsers: users.length,
      totalSwaps: swapRequests.length,
      successfulSwaps,
      openDisputes: disputes.filter((d) => d.status === "under_review").length,
      totalWaterSavedLiters: totalWaterSaved,
      totalCo2SavedKg: Math.round(totalCo2Saved)
    },
    items,
    users,
    swaps: swapRequests,
    disputes
  });
});

app.post("/api/admin/moderate-item/:id", async (req, res) => {
  const { action } = req.body;
  const newStatus = action === "remove" ? "removed_by_admin" : "available";

  if (isMongoConnected) {
    const item = await ClothingItem.findOneAndUpdate({ id: req.params.id }, { status: newStatus }, { new: true });
    return res.json({ message: `Item ${action}d by administrator`, item });
  }

  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  item.status = newStatus;
  res.json({ message: `Item ${action}d by administrator`, item });
});

app.post("/api/admin/disputes/:id/resolve", async (req, res) => {
  const notes = req.body.notes || "Resolved by admin consensus.";

  if (isMongoConnected) {
    const dispute = await Dispute.findOneAndUpdate(
      { id: req.params.id },
      { status: "resolved", resolutionNotes: notes },
      { new: true }
    );
    return res.json({ message: "Dispute resolved", dispute });
  }

  const dispute = disputes.find((d) => d.id === req.params.id);
  if (!dispute) return res.status(404).json({ error: "Dispute not found" });
  dispute.status = "resolved";
  dispute.resolutionNotes = notes;
  res.json({ message: "Dispute resolved", dispute });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Clothing Swap Marketplace Server running on port ${PORT}`);
  });
}

export default app;
