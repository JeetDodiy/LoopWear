import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { 
  fetchChatMessages, 
  sendChatMessage, 
  updateSwapStatus 
} from "../services/api";
import confetti from "canvas-confetti";
import { 
  Send, 
  ArrowLeftRight, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Truck, 
  MessageSquare, 
  Sparkles,
  ShieldCheck
} from "lucide-react";

export function ChatPage({ activeSwapId, setActivePage }) {
  const { currentUser, swaps, refreshSwaps } = useApp();

  // Selected swap
  const [selectedSwapId, setSelectedSwapId] = useState(activeSwapId || swaps[0]?.id || "");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync selectedSwapId if activeSwapId changes
  useEffect(() => {
    if (activeSwapId) {
      setSelectedSwapId(activeSwapId);
    } else if (swaps.length > 0 && !selectedSwapId) {
      setSelectedSwapId(swaps[0].id);
    }
  }, [activeSwapId, swaps]);

  const activeSwap = swaps.find((s) => s.id === selectedSwapId) || swaps[0];

  // Load chat messages
  const loadMessages = async () => {
    if (!activeSwap) return;
    try {
      const data = await fetchChatMessages(activeSwap.id);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedSwapId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeSwap || !currentUser) return;
    setSending(true);
    try {
      await sendChatMessage(activeSwap.id, currentUser.id, inputMessage.trim());
      setInputMessage("");
      await loadMessages();
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!activeSwap) return;
    setStatusUpdating(true);
    try {
      await updateSwapStatus(activeSwap.id, newStatus);
      if (newStatus === "accepted" || newStatus === "completed") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      await refreshSwaps();
      await loadMessages();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const otherUserName = activeSwap?.requesterId === currentUser?.id
    ? activeSwap?.targetOwnerName
    : activeSwap?.requesterName;

  const isTargetOwner = activeSwap?.targetOwnerId === currentUser?.id;

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="content-wrapper">
        <div style={{ marginBottom: "24px" }}>
          <span className="badge badge-yellow" style={{ marginBottom: "6px" }}>
            Real-Time Negotiation Hub
          </span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>Swap Chats & Deal Finalization</h1>
        </div>

        {swaps.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <MessageSquare size={48} color="var(--palette-pink-light)" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>No active swap negotiations yet</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Explore the listings, find a piece you like, and send a swap request to open a negotiation channel.
            </p>
            <button className="btn-primary" onClick={() => setActivePage("listings")}>
              Browse Clothes Now
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px", minHeight: "680px" }}>
            {/* Conversation List Sidebar */}
            <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px", color: "var(--text-muted)" }}>
                Active Deals ({swaps.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto" }}>
                {swaps.map((s) => {
                  const isSelected = s.id === selectedSwapId;
                  const otherName = s.requesterId === currentUser?.id ? s.targetOwnerName : s.requesterName;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSwapId(s.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "var(--radius-md)",
                        background: isSelected ? "rgba(255, 97, 248, 0.12)" : "var(--bg-surface)",
                        border: isSelected ? "1px solid var(--palette-pink-neon)" : "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 800, fontSize: "0.88rem" }}>{otherName}</span>
                        <span className={`badge ${
                          s.status === "completed" || s.status === "accepted" ? "badge-green" : s.status === "rejected" ? "badge-pink" : "badge-yellow"
                        }`} style={{ fontSize: "0.68rem" }}>
                          {s.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.targetItemTitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Chat Conversation Area */}
            {activeSwap && (
              <div className="glass-card" style={{ padding: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Pinned Deal Agreement Card Header */}
                <div style={{
                  padding: "16px 20px",
                  background: "rgba(20, 23, 33, 0.95)",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img src={activeSwap.targetItemImage} alt="target" style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }} />
                      <div style={{ margin: "0 -4px", zIndex: 2, background: "#121316", borderRadius: "50%", padding: "4px" }}>
                        <ArrowLeftRight size={14} color="var(--palette-yellow)" />
                      </div>
                      <img src={activeSwap.offeredItemImage} alt="offered" style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }} />
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        Trading with <span style={{ color: "var(--palette-pink-light)" }}>{otherUserName}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Fairness: <strong>{activeSwap.fairnessScore}%</strong></span>
                        <span>&bull;</span>
                        <span>{activeSwap.exchangeType === "local_meetup" ? "📍 Local Handover" : "📦 Courier Ship"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Negotiation Action Buttons */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {activeSwap.status === "pending" || activeSwap.status === "negotiating" ? (
                      <>
                        <button
                          className="btn-primary btn-sm"
                          disabled={statusUpdating}
                          onClick={() => handleStatusChange("accepted")}
                        >
                          <CheckCircle2 size={16} /> Accept Deal
                        </button>
                        <button
                          className="btn-outline btn-sm"
                          disabled={statusUpdating}
                          onClick={() => handleStatusChange("rejected")}
                          style={{ color: "#ff8b8b" }}
                        >
                          <XCircle size={16} /> Decline
                        </button>
                      </>
                    ) : activeSwap.status === "accepted" ? (
                      <button
                        className="btn-secondary btn-sm"
                        disabled={statusUpdating}
                        onClick={() => handleStatusChange("completed")}
                      >
                        <Sparkles size={16} /> Confirm Handover Complete
                      </button>
                    ) : (
                      <span className="badge badge-green" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
                        Swap Successfully Completed!
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages Body */}
                <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(11, 13, 19, 0.4)" }}>
                  {messages.map((m) => {
                    const isMe = m.senderId === currentUser?.id;
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          maxWidth: "75%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isMe ? "flex-end" : "flex-start"
                        }}
                      >
                        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "4px" }}>
                          {m.senderName} &bull; {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: isMe ? "var(--palette-pink-neon)" : "var(--bg-elevated)",
                            color: isMe ? "#FFFFFF" : "var(--text-main)",
                            border: isMe ? "none" : "1px solid var(--border-subtle)",
                            fontSize: "0.92rem",
                            lineHeight: 1.4,
                            boxShadow: isMe ? "var(--glow-pink)" : "none"
                          }}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: "14px 20px",
                    background: "var(--bg-surface)",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: "10px"
                  }}
                >
                  <input
                    type="text"
                    placeholder="Discuss handover spot, sizing, or counter-offer..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={{ flex: 1, borderRadius: "var(--radius-full)" }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={sending || !inputMessage.trim()}
                    style={{ borderRadius: "var(--radius-full)", padding: "10px 18px" }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
