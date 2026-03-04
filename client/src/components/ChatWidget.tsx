import React, { useState, useRef, useEffect } from "react";
import { apiUrl } from "../config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  toggleBtn: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#1E3A5F",
    color: "#fff",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    transition: "background 0.2s",
  },
  window: {
    position: "fixed",
    bottom: "90px",
    right: "24px",
    width: "360px",
    height: "500px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#1E3A5F",
    color: "#fff",
    padding: "16px 20px",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#F5F7FA",
  },
  userMsg: {
    alignSelf: "flex-end",
    background: "#1E3A5F",
    color: "#fff",
    borderRadius: "16px 16px 4px 16px",
    padding: "10px 14px",
    maxWidth: "80%",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  assistantMsg: {
    alignSelf: "flex-start",
    background: "#fff",
    color: "#222",
    borderRadius: "16px 16px 16px 4px",
    padding: "10px 14px",
    maxWidth: "80%",
    fontSize: "14px",
    lineHeight: "1.5",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  inputRow: {
    display: "flex",
    padding: "12px",
    gap: "8px",
    borderTop: "1px solid #E5E7EB",
    background: "#fff",
  },
  input: {
    flex: 1,
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "Arial, sans-serif",
  },
  sendBtn: {
    background: "#1E3A5F",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  sendBtnDisabled: {
    background: "#9CA3AF",
    cursor: "not-allowed",
  },
  typingDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#9CA3AF",
    margin: "0 2px",
    animation: "bounce 1s infinite",
  },
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Seiko store assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const postRes = await fetch(apiUrl("/api/v1/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!postRes.ok) throw new Error("Chat request failed");

      const { runId } = (await postRes.json()) as { runId: string };

      // Poll until the job completes
      let text = "";
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(apiUrl(`/api/v1/chat/${runId}`));
        const poll = (await pollRes.json()) as { status: string; text?: string };
        if (poll.status === "COMPLETED" || poll.status === "FAILED") {
          text = poll.text ?? "Sorry, something went wrong. Please try again.";
          break;
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: text || "No response received." };
        return updated;
      });
    } catch (_err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        style={styles.toggleBtn}
        onClick={() => setOpen((o) => !o)}
        title="Open assistant"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div style={styles.window}>
          <div style={styles.header}>
            <span>⌚</span>
            <span>Seiko Assistant</span>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === "user" ? styles.userMsg : styles.assistantMsg}>
                {msg.content || (
                  <span>
                    <span style={styles.typingDot} />
                    <span style={styles.typingDot} />
                    <span style={styles.typingDot} />
                  </span>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendBtn,
                ...(loading || !input.trim() ? styles.sendBtnDisabled : {}),
              }}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
