const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api"
);

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("loopwear_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

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
    headers: getAuthHeaders(),
    body: JSON.stringify(itemData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create clothing listing");
  return data;
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete listing");
  return data;
}

export async function loginUser(identifierOrData, password = "", requiredRole = "") {
  let payload = {};
  if (typeof identifierOrData === "object" && identifierOrData !== null) {
    payload = identifierOrData;
  } else if (typeof identifierOrData === "string") {
    if (identifierOrData.startsWith("usr_")) {
      payload = { userId: identifierOrData };
    } else {
      payload = { 
        username: identifierOrData, 
        email: identifierOrData, 
        password, 
        requiredRole 
      };
    }
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Authentication failed");
  }
  if (data.token && typeof window !== "undefined") {
    localStorage.setItem("loopwear_token", data.token);
  }
  return data;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  if (data.token && typeof window !== "undefined") {
    localStorage.setItem("loopwear_token", data.token);
  }
  return data;
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
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || "Failed to create swap request");
  return resData;
}

export async function updateSwapStatus(swapId, status) {
  const res = await fetch(`${API_BASE}/swaps/${swapId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || "Failed to update swap status");
  return resData;
}

export async function fetchChatMessages(swapId) {
  const res = await fetch(`${API_BASE}/chats/${swapId}`);
  if (!res.ok) throw new Error("Failed to load chat messages");
  return res.json();
}

export async function sendChatMessage(swapId, senderId, text) {
  const res = await fetch(`${API_BASE}/chats/${swapId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ senderId, text })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send message");
  return data;
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
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load admin stats");
  return data;
}

export async function moderateListing(itemId, action) {
  const res = await fetch(`${API_BASE}/admin/moderate-item/${itemId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Moderation request failed");
  return data;
}

export async function resolveDispute(disputeId, notes) {
  const res = await fetch(`${API_BASE}/admin/disputes/${disputeId}/resolve`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Dispute resolution failed");
  return data;
}
