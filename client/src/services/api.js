const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api"
);

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchItems(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "All") {
      query.append(k, v);
    }
  });
  const res = await fetch(`${API_BASE}/items?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch clothing items");
  return res.json();
}

export async function fetchItemById(id) {
  const res = await fetch(`${API_BASE}/items/${id}`);
  if (!res.ok) throw new Error("Item not found");
  return res.json();
}

export async function createItem(itemData) {
  const res = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData)
  });
  if (!res.ok) throw new Error("Failed to create clothing listing");
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete listing");
  return res.json();
}

export async function loginUser(emailOrUserId) {
  const isId = emailOrUserId.startsWith("usr_");
  const payload = isId ? { userId: emailOrUserId } : { email: emailOrUserId };
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Authentication failed");
  return res.json();
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function fetchSwaps(userId) {
  const query = userId ? `?userId=${userId}` : "";
  const res = await fetch(`${API_BASE}/swaps${query}`);
  if (!res.ok) throw new Error("Failed to fetch swaps");
  return res.json();
}

export async function createSwapRequest(data) {
  const res = await fetch(`${API_BASE}/swaps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create swap request");
  return res.json();
}

export async function updateSwapStatus(swapId, status) {
  const res = await fetch(`${API_BASE}/swaps/${swapId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update swap status");
  return res.json();
}

export async function fetchChatMessages(swapId) {
  const res = await fetch(`${API_BASE}/chats/${swapId}`);
  if (!res.ok) throw new Error("Failed to load chat messages");
  return res.json();
}

export async function sendChatMessage(swapId, senderId, text) {
  const res = await fetch(`${API_BASE}/chats/${swapId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, text })
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function evaluateSwapValue(itemA, itemB) {
  const res = await fetch(`${API_BASE}/calculator/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemA, itemB })
  });
  return res.json();
}

export async function fetchAdminOverview() {
  const res = await fetch(`${API_BASE}/admin/overview`);
  if (!res.ok) throw new Error("Failed to load admin stats");
  return res.json();
}

export async function moderateListing(itemId, action) {
  const res = await fetch(`${API_BASE}/admin/moderate-item/${itemId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action })
  });
  return res.json();
}

export async function resolveDispute(disputeId, notes) {
  const res = await fetch(`${API_BASE}/admin/disputes/${disputeId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes })
  });
  return res.json();
}
