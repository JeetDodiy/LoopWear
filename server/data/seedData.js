export const initialUsers = [
  {
    id: "usr_1",
    name: "Maya Lin",
    username: "maya",
    email: "maya.lin@swapfashion.org",
    password: "maya123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    location: "Bandra West, Mumbai (1.2 km away)",
    city: "Mumbai, MH",
    bio: "Vintage archivist & zero-waste stylist. Passionate about denim and 90s streetwear.",
    sustainabilityScore: {
      itemsSwapped: 8,
      waterSavedLiters: 19200,
      co2SavedKg: 46.5
    },
    memberSince: "2024-03-12"
  },
  {
    id: "usr_2",
    name: "Julian Rivera",
    username: "julian",
    email: "julian.rivera@swapfashion.org",
    password: "julian123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    location: "Indiranagar, Bengaluru (2.8 km away)",
    city: "Bengaluru, KA",
    bio: "Outdoor techwear & rugged outerwear collector. Swapping sizes after closet detox.",
    sustainabilityScore: {
      itemsSwapped: 12,
      waterSavedLiters: 27500,
      co2SavedKg: 68.2
    },
    memberSince: "2023-11-05"
  },
  {
    id: "usr_3",
    name: "Elena Rostova",
    username: "elena",
    email: "elena.rostova@swapfashion.org",
    password: "elena123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    location: "Hauz Khas, New Delhi (4.5 km away)",
    city: "New Delhi, DL",
    bio: "Minimalist capsule wardrobe enthusiast. Linen blazers, clean cuts, and sustainable chic.",
    sustainabilityScore: {
      itemsSwapped: 5,
      waterSavedLiters: 11800,
      co2SavedKg: 28.0
    },
    memberSince: "2024-06-20"
  },
  {
    id: "usr_admin",
    name: "Platform Supervisor",
    username: "admin",
    email: "admin@unswap.org",
    password: "admin123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    location: "Connaught Place, New Delhi",
    city: "New Delhi, DL",
    bio: "Chief Community Officer & Environmental Impact Auditor.",
    sustainabilityScore: {
      itemsSwapped: 34,
      waterSavedLiters: 82000,
      co2SavedKg: 198.4
    },
    memberSince: "2023-01-01"
  }
];

export const initialClothingItems = [
  {
    id: "item_1",
    title: "Vintage Carhartt Detroit Duck Canvas Jacket",
    category: "Outerwear",
    brand: "Carhartt",
    size: "L",
    gender: "Unisex",
    condition: "Gently Used",
    conditionRating: 4.5,
    estimatedValue: 4500,
    description: "Authentic blanket-lined Detroit jacket in faded tobacco tan. Corduroy collar, heavy brass zipper, authentic patina with no tears or odors. Perfect heavyweight streetwear layering piece.",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Bandra West, Mumbai",
    distanceKm: 1.2,
    ownerId: "usr_1",
    ownerName: "Maya Lin",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-01T10:00:00Z",
    tags: ["vintage", "streetwear", "heavyweight", "workwear"],
    impactWaterSavedLiters: 2700,
    impactCo2SavedKg: 6.8
  },
  {
    id: "item_2",
    title: "Patagonia Retro-X Deep Pile Sherpa Fleece",
    category: "Outerwear",
    brand: "Patagonia",
    size: "M",
    gender: "Unisex",
    condition: "Like New",
    conditionRating: 4.8,
    estimatedValue: 4800,
    description: "Natural fleece with contrast chest pocket in midnight teal. Windproof barrier laminate, worn only twice on a weekend hike. Completely spotless, super cozy.",
    images: [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Indiranagar, Bengaluru",
    distanceKm: 2.8,
    ownerId: "usr_2",
    ownerName: "Julian Rivera",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-03T14:30:00Z",
    tags: ["outdoor", "fleece", "sustainable", "hiking"],
    impactWaterSavedLiters: 3100,
    impactCo2SavedKg: 7.4
  },
  {
    id: "item_3",
    title: "Levi's 501 1993 Straight Leg Raw Denim Jeans",
    category: "Bottoms",
    brand: "Levi's",
    size: "32/32",
    gender: "Men",
    condition: "Like New",
    conditionRating: 4.9,
    estimatedValue: 2800,
    description: "Rigid non-stretch 100% cotton selvedge denim. Classic button fly, medium stone wash with natural honeycomb fading potential. Unaltered hem.",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Bandra West, Mumbai",
    distanceKm: 1.2,
    ownerId: "usr_1",
    ownerName: "Maya Lin",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-04T09:15:00Z",
    tags: ["selvedge", "rawdenim", "501", "classic"],
    impactWaterSavedLiters: 7600,
    impactCo2SavedKg: 13.0
  },
  {
    id: "item_4",
    title: "Sézane Paris Structured Linen Double-Breasted Blazer",
    category: "Tops",
    brand: "Sézane",
    size: "S",
    gender: "Women",
    condition: "Brand New",
    conditionRating: 5.0,
    estimatedValue: 5500,
    description: "Brand new tailored linen blazer in oatmeal ecru. Tortoiseshell buttons, tailored lapel, breathable organic flax linen. Never worn.",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Hauz Khas, New Delhi",
    distanceKm: 4.5,
    ownerId: "usr_3",
    ownerName: "Elena Rostova",
    ownerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-05T16:20:00Z",
    tags: ["parisian", "linen", "tailored", "luxury"],
    impactWaterSavedLiters: 2400,
    impactCo2SavedKg: 5.2
  },
  {
    id: "item_5",
    title: "Nike ACG Therma-FIT Oversized Pullover Hoodie",
    category: "Streetwear",
    brand: "Nike",
    size: "L",
    gender: "Unisex",
    condition: "Gently Used",
    conditionRating: 4.4,
    estimatedValue: 3200,
    description: "Heavyweight 450gsm fleece hoodie in washed cargo sage. Water-repellent finish, zip pouch front pocket, embroidered ACG logo on chest.",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Indiranagar, Bengaluru",
    distanceKm: 2.8,
    ownerId: "usr_2",
    ownerName: "Julian Rivera",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-06T11:45:00Z",
    tags: ["acg", "streetwear", "heavyweight", "fleece"],
    impactWaterSavedLiters: 2100,
    impactCo2SavedKg: 4.9
  },
  {
    id: "item_6",
    title: "Dr. Martens 1460 Smooth Leather 8-Eye Boots",
    category: "Footwear",
    brand: "Dr. Martens",
    size: "UK 8 / US 9",
    gender: "Unisex",
    condition: "Gently Used",
    conditionRating: 4.3,
    estimatedValue: 6500,
    description: "Iconic cherry red smooth leather 8-eye combat boots. Goodyear welted with yellow stitching and AirWair bouncing soles. Already broken in comfortably, freshly polished.",
    images: [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Bandra West, Mumbai",
    distanceKm: 1.2,
    ownerId: "usr_1",
    ownerName: "Maya Lin",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-07T13:00:00Z",
    tags: ["leather", "boots", "punk", "vintage"],
    impactWaterSavedLiters: 4800,
    impactCo2SavedKg: 14.5
  },
  {
    id: "item_7",
    title: "Reformation Silk Slip Midi Dress in Marigold",
    category: "Dresses",
    brand: "Reformation",
    size: "M",
    gender: "Women",
    condition: "Like New",
    conditionRating: 4.7,
    estimatedValue: 5200,
    description: "100% sustainable mulberry silk bias-cut midi dress. Adjustable spaghetti straps, cow neckline, flattering silhouette in lustrous marigold gold.",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Hauz Khas, New Delhi",
    distanceKm: 4.5,
    ownerId: "usr_3",
    ownerName: "Elena Rostova",
    ownerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-08T18:10:00Z",
    tags: ["silk", "reformation", "evening", "sustainable"],
    impactWaterSavedLiters: 1900,
    impactCo2SavedKg: 4.2
  },
  {
    id: "item_8",
    title: "Arc'teryx Atom LT Coreloft Insulated Hoody",
    category: "Outerwear",
    brand: "Arc'teryx",
    size: "M",
    gender: "Men",
    condition: "Like New",
    conditionRating: 4.9,
    estimatedValue: 7500,
    description: "Lightweight, breathable Coreloft insulation hoody in Kingfisher navy. Tyono 20 face fabric sheds moisture, fleece side stretch panels for venting.",
    images: [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=80"
    ],
    location: "Indiranagar, Bengaluru",
    distanceKm: 2.8,
    ownerId: "usr_2",
    ownerName: "Julian Rivera",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    status: "available",
    createdAt: "2026-10-09T08:20:00Z",
    tags: ["arcteryx", "gorpcore", "technical", "hoody"],
    impactWaterSavedLiters: 3400,
    impactCo2SavedKg: 8.9
  }
];

export const initialSwapRequests = [
  {
    id: "swap_101",
    requesterId: "usr_2",
    requesterName: "Julian Rivera",
    requesterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    targetOwnerId: "usr_1",
    targetOwnerName: "Maya Lin",
    targetItemId: "item_1",
    targetItemTitle: "Vintage Carhartt Detroit Duck Canvas Jacket",
    targetItemImage: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
    targetItemValue: 4500,
    offeredItemId: "item_2",
    offeredItemTitle: "Patagonia Retro-X Deep Pile Sherpa Fleece",
    offeredItemImage: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=80",
    offeredItemValue: 4800,
    status: "negotiating",
    fairnessScore: 94,
    exchangeType: "local_meetup",
    locationProposal: "Shivaji Park, Dadar West",
    note: "Hey Maya! Love your Detroit jacket. Would you be open to swapping for my Patagonia Retro-X? Both are solid outerwear pieces.",
    createdAt: "2026-10-10T11:00:00Z",
    updatedAt: "2026-10-11T15:20:00Z"
  },
  {
    id: "swap_102",
    requesterId: "usr_3",
    requesterName: "Elena Rostova",
    requesterAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    targetOwnerId: "usr_1",
    targetOwnerName: "Maya Lin",
    targetItemId: "item_3",
    targetItemTitle: "Levi's 501 1993 Straight Leg Raw Denim Jeans",
    targetItemImage: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    targetItemValue: 2800,
    offeredItemId: "item_4",
    offeredItemTitle: "Sézane Paris Structured Linen Double-Breasted Blazer",
    offeredItemImage: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
    offeredItemValue: 5500,
    status: "pending",
    fairnessScore: 82,
    exchangeType: "courier",
    locationProposal: "BlueDart Express Courier Box",
    note: "Hi Maya! I know the blazer is slightly higher in retail value, but I've been searching for these 501s in size 32 for months!",
    createdAt: "2026-10-11T17:45:00Z",
    updatedAt: "2026-10-11T17:45:00Z"
  }
];

export const initialChatMessages = [
  {
    id: "msg_1",
    swapId: "swap_101",
    senderId: "usr_2",
    senderName: "Julian Rivera",
    text: "Hey Maya! Sent over an offer with my Patagonia fleece for your Carhartt jacket. Let me know what you think!",
    timestamp: "2026-10-10T11:02:00Z"
  },
  {
    id: "msg_2",
    swapId: "swap_101",
    senderId: "usr_1",
    senderName: "Maya Lin",
    text: "Hey Julian! The Retro-X looks in awesome condition. Quick question — is the fleece pile still fluffy around the elbows?",
    timestamp: "2026-10-10T12:15:00Z"
  },
  {
    id: "msg_3",
    swapId: "swap_101",
    senderId: "usr_2",
    senderName: "Julian Rivera",
    text: "Yes, completely! I only wore it twice casually, no matting at all. Can meet by Bandra Bandstand or Linking Road this Thursday if that works?",
    timestamp: "2026-10-10T13:40:00Z"
  },
  {
    id: "msg_4",
    swapId: "swap_101",
    senderId: "usr_1",
    senderName: "Maya Lin",
    text: "Linking Road on Thursday afternoon sounds perfect! Let's lock in the deal.",
    timestamp: "2026-10-11T15:20:00Z"
  }
];

export const initialDisputes = [
  {
    id: "disp_1",
    swapId: "swap_101",
    reportedBy: "usr_2",
    reporterName: "Julian Rivera",
    targetUser: "usr_4_external",
    reason: "Item condition discrepancy regarding vintage leather jacket zip",
    status: "under_review",
    createdAt: "2026-10-09T14:00:00Z",
    resolutionNotes: "Admin requested photo of zipper teeth before confirming exchange integrity."
  }
];
