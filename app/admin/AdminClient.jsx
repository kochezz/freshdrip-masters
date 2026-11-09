"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LeadRow({ lead, statuses }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function change(e) {
    const next = e.target.value;
    setStatus(next);
    setSaving(true);
    await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    await fetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr>
      <td>
        <b>{lead.entry}</b>
        <br />
        <span className="muted">{lead.when}</span>
      </td>
      <td>
        <b>{lead.name}</b>
        <br />
        <span className="muted">{lead.company}</span>
      </td>
      <td>
        {lead.phone}
        <br />
        <span className="muted">{lead.email}</span>
      </td>
      <td>
        {lead.hot && <span className="pill hot">HOT</span>} {lead.interests || <span className="muted">Not specified</span>}
      </td>
      <td>
        <span className="pill src">{lead.source}</span>
      </td>
      <td>
        <select aria-label={`Status for ${lead.name}`} value={status} onChange={change} disabled={saving}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </td>
      <td>
        {confirmDelete ? (
          <span style={{ display: "flex", gap: 6 }}>
            <button className="btn small danger" onClick={remove}>Delete</button>
            <button className="btn small" onClick={() => setConfirmDelete(false)}>Keep</button>
          </span>
        ) : (
          <button className="btn small" onClick={() => setConfirmDelete(true)} aria-label={`Delete ${lead.name}`}>
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}

export function DrawButton() {
  const router = useRouter();
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");

  async function draw() {
    setState("busy");
    const res = await fetch("/api/admin/draw", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Draw failed.");
      setState("idle");
      return;
    }
    setMsg(`${data.name} (${data.company}), ${data.entryNo}. Drawn from ${data.poolSize} entries.`);
    setState("idle");
    router.refresh();
  }

  if (state === "confirm") {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn primary" onClick={draw}>Yes, draw now</button>
        <button className="btn" onClick={() => setState("idle")}>Cancel</button>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button className="btn primary" disabled={state === "busy"} onClick={() => setState("confirm")}>
        {state === "busy" ? "Drawing…" : "Draw a winner"}
      </button>
      {msg && <span style={{ fontSize: ".84rem" }}>{msg}</span>}
    </div>
  );
}
