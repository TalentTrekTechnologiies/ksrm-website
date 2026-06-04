"use client"

import { useEffect, useState } from "react"

const API = "http://localhost:4000/notifications"

interface Notification {
  id: string
  text: string
  active: boolean
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    fetch(`${API}/admin`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setError("Could not reach backend. Is it running on port 4000?"))
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    const text = input.trim()
    if (!text) return
    setLoading(true)
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    setInput("")
    setLoading(false)
    load()
  }

  const toggle = async (id: string) => {
    await fetch(`${API}/${id}/toggle`, { method: "PATCH" })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this notification?")) return
    await fetch(`${API}/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div style={{ maxWidth: "720px", margin: "40px auto", padding: "0 24px", fontFamily: "sans-serif" }}>

      <h1 style={{ color: "#2B3490", fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>
        Scrolling Notifications
      </h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>
        Active notifications appear in the header ticker in the order shown below.
      </p>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "12px 16px", borderRadius: "6px", marginBottom: "24px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* ADD FORM */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Type a notification and press Enter or click Add…"
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: "14px",
            border: "2px solid #2B3490",
            borderRadius: "6px",
            outline: "none",
          }}
        />
        <button
          onClick={add}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 22px",
            background: loading || !input.trim() ? "#94a3b8" : "#2B3490",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Adding…" : "Add"}
        </button>
      </div>

      {/* LIST */}
      {items.length === 0 ? (
        <p style={{ color: "#888", fontSize: "14px" }}>No notifications yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                border: `1px solid ${n.active ? "#2B3490" : "#e2e8f0"}`,
                borderRadius: "6px",
                background: n.active ? "#f0f3ff" : "#f8fafc",
                opacity: n.active ? 1 : 0.6,
              }}
            >
              {/* STATUS DOT */}
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                background: n.active ? "#22c55e" : "#94a3b8",
              }} />

              {/* TEXT */}
              <span style={{ flex: 1, fontSize: "14px", color: "#111" }}>{n.text}</span>

              {/* TOGGLE */}
              <button
                onClick={() => toggle(n.id)}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "1px solid #2B3490",
                  borderRadius: "4px",
                  background: "transparent",
                  color: "#2B3490",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {n.active ? "Deactivate" : "Activate"}
              </button>

              {/* DELETE */}
              <button
                onClick={() => remove(n.id)}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "1px solid #E8112D",
                  borderRadius: "4px",
                  background: "transparent",
                  color: "#E8112D",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
