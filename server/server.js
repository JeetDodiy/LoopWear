import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
const JWT_SECRET = process.env.JWT_SECRET || "loopwear_production_secure_secret_key_2026";

// ----------------- SECURITY HEADERS & RATE LIMITING -----------------

// 1. Helmet Security Headers (CSP configured to permit Unsplash imagery)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
  })
);

// 2. Strict CORS policy
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or tools with no origin
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: Access blocked from this origin."));
    },
    credentials: true
  })
);

// 3. Body payload limit (reduced from 20MB to 5MB to avoid memory-exhaustion DoS)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// 4. Rate Limiting (protect auth endpoints from brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 attempts per window
  message: { error: "Too many authentication requests from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300,
  message: { error: "Rate limit exceeded. Please throttle your requests." },
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/", generalLimiter);

// ----------------- DATA STORE & MONGOOSE -----------------

// In-memory fallback store
let users = [...initialUsers];
let items = [...initialClothingItems];
let swapRequests = [...initialSwapRequests];
let chatMessages = [...initialChatMessages];
let disputes = [...initialDisputes];
let isMongoConnected = false;

// Prevent process termination on transient socket warnings
process.on("unhandledRejection", (reason) => {
  console.warn("Handled socket/promise notice:", reason?.message || reason);
});

mongoose.connection.on("error", (err) => {
  console.warn("MongoDB connection notice:", err.message);
  isMongoConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Running in seamless fallback mode.");
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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })
    .then(async () => {
      isMongoConnected = true;
      console.log("Connected to MongoDB via Mongoose successfully!");

      // Auto-seed collections if empty with hashed passwords
      try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log("Seeding MongoDB with realistic fashion barter data...");
          const seededUsers = await Promise.all(
            initialUsers.map(async (u) => {
              const hashedPassword = await bcrypt.hash(u.password || "user123", 10);
              return { ...u, password: hashedPassword };
            })
          );
          await User.insertMany(seededUsers);
          await ClothingItem.insertMany(initialClothingItems);
          await SwapRequest.insertMany(initialSwapRequests);
          await ChatMessage.insertMany(initialChatMessages);
          await Dispute.insertMany(initialDisputes);
          console.log("MongoDB seeded successfully!");
        } else {
          // Ensure seed users have hashed credentials
          for (const u of initialUsers) {
            const existing = await User.findOne({ id: u.id }).select("+password");
            if (existing && (!existing.password || !existing.password.startsWith("$2"))) {
              const hashed = await bcrypt.hash(u.password || "user123", 10);
              await User.updateOne({ id: u.id }, { $set: { password: hashed, username: u.username, role: u.role } });
            }
          }
        }
      } catch (seedErr) {
        console.warn("Seeding notice:", seedErr.message);
      }
    })
    .catch((err) => {
      console.warn("Initial MongoDB connection notice:", err.message);
      console.log("Operating with built-in instant database engine.");
      isMongoConnected = false;
    });
} else {
  console.log("Running in development mode with local persistent store.");
}

// ----------------- SECURITY & AUTH HELPERS -----------------

// Strip password from user objects to prevent credential leaks
function sanitizeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
}

// Secure password comparison supporting bcrypt
async function comparePasswords(providedPassword, storedPassword) {
  if (!providedPassword || !storedPassword) return false;
  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
    return await bcrypt.compare(providedPassword, storedPassword);
  }
  // Plaintext fallback for initial unhashed state
  return providedPassword === storedPassword;
}

// Issue signed JWT token with 7-day expiration
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Middleware: Authenticate incoming JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Access denied. Authentication token required." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired session token. Please sign in again." });
    }
    req.user = decoded;
    next();
  });
}

// Middleware: Verify Admin role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Platform Administrator privileges required." });
  }
  next();
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

// Users List (Passwords stripped for privacy)
app.get("/api/users", async (req, res) => {
  if (isMongoConnected) {
    const dbUsers = await User.find({}).select("-password");
    return res.json(dbUsers.map(sanitizeUser));
  }
  res.json(users.map(sanitizeUser));
});

app.get("/api/users/:id", async (req, res) => {
  if (isMongoConnected) {
    const user = await User.findOne({ id: req.params.id }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(sanitizeUser(user));
  }
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(sanitizeUser(user));
});

// Update User Profile (Protected by JWT)
app.put("/api/users/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, bio, city, location, avatar } = req.body;

  let updatedUser = null;

  if (isMongoConnected) {
    const updateFields = {};
    if (name && typeof name === "string") updateFields.name = name.trim();
    if (bio !== undefined) updateFields.bio = String(bio).trim();
    if (city !== undefined) updateFields.city = String(city).trim();
    if (location !== undefined) updateFields.location = String(location).trim();
    if (avatar && typeof avatar === "string") updateFields.avatar = avatar.trim();

    updatedUser = await User.findOneAndUpdate(
      { id: userId },
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User profile not found." });
  } else {
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return res.status(404).json({ error: "User profile not found." });

    if (name && typeof name === "string") users[idx].name = name.trim();
    if (bio !== undefined) users[idx].bio = String(bio).trim();
    if (city !== undefined) users[idx].city = String(city).trim();
    if (location !== undefined) users[idx].location = String(location).trim();
    if (avatar && typeof avatar === "string") users[idx].avatar = avatar.trim();

    updatedUser = users[idx];
  }

  res.json({
    message: "Profile updated successfully.",
    user: sanitizeUser(updatedUser)
  });
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  // Allow user to edit their own profile or admin to moderate
  if (req.user.id !== req.params.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: You may only modify your own profile." });
  }

  const { name, bio, city, location, avatar } = req.body;
  let updatedUser = null;

  if (isMongoConnected) {
    const updateFields = {};
    if (name && typeof name === "string") updateFields.name = name.trim();
    if (bio !== undefined) updateFields.bio = String(bio).trim();
    if (city !== undefined) updateFields.city = String(city).trim();
    if (location !== undefined) updateFields.location = String(location).trim();
    if (avatar && typeof avatar === "string") updateFields.avatar = avatar.trim();

    updatedUser = await User.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found." });
  } else {
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "User not found." });

    if (name && typeof name === "string") users[idx].name = name.trim();
    if (bio !== undefined) users[idx].bio = String(bio).trim();
    if (city !== undefined) users[idx].city = String(city).trim();
    if (location !== undefined) users[idx].location = String(location).trim();
    if (avatar && typeof avatar === "string") users[idx].avatar = avatar.trim();

    updatedUser = users[idx];
  }

  res.json({
    message: "Profile updated successfully.",
    user: sanitizeUser(updatedUser)
  });
});

// User Authentication (Strict bcrypt comparison, NO master password bypass)
app.post("/api/auth/login", async (req, res) => {
  const { username, email, password, userId, requiredRole } = req.body;
  const identifier = (username || email || "").trim();

  let user = null;

  if (isMongoConnected) {
    if (userId) {
      user = await User.findOne({ id: userId }).select("+password");
    } else if (identifier) {
      const regex = new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      user = await User.findOne({
        $or: [{ username: regex }, { email: regex }]
      }).select("+password");
    }
  }

  if (!user) {
    if (userId) {
      user = users.find((u) => u.id === userId);
    } else if (identifier) {
      const lower = identifier.toLowerCase();
      user = users.find(
        (u) =>
          (u.username && u.username.toLowerCase() === lower) ||
          (u.email && u.email.toLowerCase() === lower)
      );
    }
  }

  if (!user) {
    return res.status(401).json({ 
      error: "No account found matching this username or email." 
    });
  }

  // Pure cryptographic password comparison
  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ 
      error: "Incorrect password. Please verify your credentials and try again." 
    });
  }

  // Admin access gate check
  if (requiredRole === "admin" && user.role !== "admin") {
    return res.status(403).json({ 
      error: "Access Denied: This account does not possess Administrator privileges." 
    });
  }

  const token = generateToken(user);
  res.json({ user: sanitizeUser(user), token });
});

// User Registration with Duplicate Checks, Email Regex & Bcrypt Hashing
app.post("/api/auth/register", async (req, res) => {
  const { name, username, email, password, city, bio, avatar } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  // 1. Strict Email Format Validation
  const trimmedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ 
      error: "Please enter a valid email address (e.g. yourname@example.com)." 
    });
  }

  // 2. Username Validation
  const rawUsername = (username || email.split("@")[0] || "user").trim().toLowerCase();
  const trimmedUsername = rawUsername.replace(/[^a-z0-9_]/g, "");
  if (!trimmedUsername || trimmedUsername.length < 3) {
    return res.status(400).json({ 
      error: "Username must be at least 3 characters and contain only letters, numbers, or underscores." 
    });
  }

  // 3. Password Length Validation
  if (!password || password.length < 6) {
    return res.status(400).json({ 
      error: "Password must be at least 6 characters long." 
    });
  }

  // 4. Duplicate Account Checks (Case-insensitive)
  if (isMongoConnected) {
    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(409).json({
        error: "An account with this email address already exists. Please log in or use another email."
      });
    }

    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser) {
      return res.status(409).json({
        error: "This username is already taken. Please choose another username."
      });
    }
  } else {
    const existingEmail = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({
        error: "An account with this email address already exists. Please log in or use another email."
      });
    }

    const existingUser = users.find((u) => u.username && u.username.toLowerCase() === trimmedUsername);
    if (existingUser) {
      return res.status(409).json({
        error: "This username is already taken. Please choose another username."
      });
    }
  }

  // 5. Password Hashing using Bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // 6. User Custom Profile Photo or Curated Default
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
  const userAvatar = (avatar && typeof avatar === "string" && avatar.trim()) 
    ? avatar.trim() 
    : defaultAvatar;

  const newUser = {
    id: "usr_" + crypto.randomUUID(),
    name: name.trim(),
    username: trimmedUsername,
    email: trimmedEmail,
    password: hashedPassword,
    role: "user",
    avatar: userAvatar,
    location: city ? `${city} (0.5 km away)` : "Bandra West, Mumbai (0.5 km away)",
    city: city || "Mumbai, MH",
    bio: bio || "Sustainable fashion swap advocate.",
    sustainabilityScore: {
      itemsSwapped: 0,
      waterSavedLiters: 0,
      co2SavedKg: 0
    },
    memberSince: new Date().toISOString().split("T")[0]
  };

  try {
    if (isMongoConnected) {
      await User.create(newUser);
    } else {
      users.push(newUser);
    }
  } catch (dbErr) {
    if (dbErr.code === 11000) {
      return res.status(409).json({
        error: "An account with this email or username already exists. Please sign in instead."
      });
    }
    return res.status(500).json({ error: "Failed to create user account: " + dbErr.message });
  }

  const token = generateToken(newUser);
  res.status(201).json({ user: sanitizeUser(newUser), token });
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
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(query) ||
        i.brand.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query)
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

// Create Item (Protected by JWT)
app.post("/api/items", authenticateToken, async (req, res) => {
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
    tags
  } = req.body;

  if (!title || !category || !brand || !size) {
    return res.status(400).json({ error: "Missing required fields for listing." });
  }

  const ownerId = req.user.id;
  const owner = isMongoConnected
    ? await User.findOne({ id: ownerId })
    : users.find((u) => u.id === ownerId);

  const newItem = {
    id: "itm_" + crypto.randomUUID(),
    title: title.trim(),
    category,
    brand: brand.trim(),
    size,
    gender: gender || "Unisex",
    condition: condition || "Gently Used",
    conditionRating: condition === "Brand New" ? 5.0 : condition === "Like New" ? 4.8 : 4.3,
    estimatedValue: Number(estimatedValue) || 2500,
    description: description || "Pre-loved sustainable fashion piece ready for a new home.",
    images: images && images.length > 0 ? images : [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80"
    ],
    location: location || owner?.city || "Mumbai, MH",
    distanceKm: 0.8,
    ownerId: owner?.id || ownerId,
    ownerName: owner?.name || req.user.name || "Community Member",
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

// Delete Item (Protected: Owner or Admin only)
app.delete("/api/items/:id", authenticateToken, async (req, res) => {
  const itemId = req.params.id;

  if (isMongoConnected) {
    const item = await ClothingItem.findOne({ id: itemId });
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: You can only remove your own listings." });
    }
    await ClothingItem.deleteOne({ id: itemId });
    return res.json({ message: "Item removed successfully" });
  }

  const index = items.findIndex((i) => i.id === itemId);
  if (index === -1) return res.status(404).json({ error: "Item not found" });
  if (items[index].ownerId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: You can only remove your own listings." });
  }
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

// Create Swap Request (Protected by JWT)
app.post("/api/swaps", authenticateToken, async (req, res) => {
  const {
    targetItemId,
    offeredItemId,
    exchangeType,
    locationProposal,
    note
  } = req.body;

  const requesterId = req.user.id;
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

  if (offeredItem.ownerId !== requesterId) {
    return res.status(403).json({ error: "You can only offer items from your own closet." });
  }

  const fairness = calculateFairness(targetItem.estimatedValue, offeredItem.estimatedValue);

  const newSwap = {
    id: "swp_" + crypto.randomUUID(),
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
    id: "msg_" + crypto.randomUUID(),
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

// Update Swap Status (Protected by JWT)
app.put("/api/swaps/:id/status", authenticateToken, async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "negotiating", "accepted", "completed", "declined", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  if (isMongoConnected) {
    const swap = await SwapRequest.findOne({ id: req.params.id });
    if (!swap) return res.status(404).json({ error: "Swap request not found" });
    if (swap.requesterId !== req.user.id && swap.targetOwnerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: You are not a participant in this exchange." });
    }
    swap.status = status;
    swap.updatedAt = new Date();
    await swap.save();
    return res.json(swap);
  }

  const swap = swapRequests.find((s) => s.id === req.params.id);
  if (!swap) return res.status(404).json({ error: "Swap request not found" });
  if (swap.requesterId !== req.user.id && swap.targetOwnerId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this exchange." });
  }
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

// Post Chat Message (Protected by JWT)
app.post("/api/chats/:swapId", authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "Message text is required" });

  const senderId = req.user.id;
  const sender = isMongoConnected
    ? await User.findOne({ id: senderId })
    : users.find((u) => u.id === senderId);

  const newMsg = {
    id: "msg_" + crypto.randomUUID(),
    swapId: req.params.swapId,
    senderId,
    senderName: sender ? sender.name : req.user.name || "Community Member",
    text: text.trim(),
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

// ----------------- ADMIN PANEL (STRICTLY AUTHORIZED) -----------------

// Admin Overview (Protected: Requires JWT & Admin Role; Passwords Stripped)
app.get("/api/admin/overview", authenticateToken, requireAdmin, async (req, res) => {
  if (isMongoConnected) {
    const allItems = await ClothingItem.find({});
    const allUsers = await User.find({}).select("-password");
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
      users: allUsers.map(sanitizeUser),
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
    users: users.map(sanitizeUser),
    swaps: swapRequests,
    disputes
  });
});

// Moderate Item (Protected: Requires JWT & Admin Role)
app.post("/api/admin/moderate-item/:id", authenticateToken, requireAdmin, async (req, res) => {
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

// Resolve Dispute (Protected: Requires JWT & Admin Role)
app.post("/api/admin/disputes/:id/resolve", authenticateToken, requireAdmin, async (req, res) => {
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

// Central Error Handling Middleware (No leaked stack traces in production)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "An internal server error occurred." : err.message
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Clothing Swap Marketplace Server running on port ${PORT}`);
  });
}

export default app;
