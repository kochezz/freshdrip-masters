import { COMPANY, DOWNLOADS, EVENT, PRIZE, TOUCHPOINTS, contact } from "./config";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function send({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "freshDRIP <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return { ok: res.ok };
  } catch (e) {
    console.error("Email failed", e?.message);
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

function siteUrl() {
  return (process.env.SITE_URL || "").replace(/\/$/, "");
}

export function sendGuestEmail(lead) {
  const c = contact();
  const base = siteUrl();
  const first = lead.full_name.split(" ")[0];
  const links = DOWNLOADS.map(
    (d) => `<p style="margin:0 0 10px"><a href="${base}${d.href}" style="color:#0E8FC2;font-weight:600">${esc(d.title)}</a> <span style="color:#6b7f95">(${d.size} PDF)</span></p>`
  ).join("");
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#0B2148;max-width:520px;margin:0 auto;padding:24px">
    <p style="font-size:22px;font-weight:800;margin:0 0 4px">fresh<span style="color:#14B3E6">DRIP</span></p>
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#14B3E6;margin:0 0 24px">${esc(EVENT.name)} ${EVENT.year}</p>
    <p>Hi ${esc(first)},</p>
    <p>Thank you for entering the freshDRIP draw. Your entry number is <b>${esc(lead.entry_no)}</b>. The winner of the water station (${esc(PRIZE.items.join(", "))}) will be announced at the prize-giving on ${esc(EVENT.drawDate)}.</p>
    <p>As promised, here are our documents:</p>
    ${links}
    <p>${esc(c.name)} from our team will be in touch. You can also reach us on ${esc(c.phone)} or ${esc(c.email)}.</p>
    <p style="color:#6b7f95;font-size:12px;margin-top:28px">${esc(COMPANY.name)} · ${esc(COMPANY.address)}<br>You received this because you entered our draw. Reply "unsubscribe" and we will remove your details.</p>
  </div>`;
  const text = `Hi ${first},\n\nThank you for entering the freshDRIP draw. Entry number: ${lead.entry_no}. Winner announced ${EVENT.drawDate}.\n\n${DOWNLOADS.map((d) => `${d.title}: ${base}${d.href}`).join("\n")}\n\n${c.name} · ${c.phone} · ${c.email}\n${COMPANY.name}`;
  return send({ to: lead.email, subject: `Your freshDRIP entry ${lead.entry_no} and documents`, html, text });
}

export function sendLeadAlert(lead) {
  const to = (process.env.LEAD_ALERT_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!to.length) return Promise.resolve({ skipped: true });
  const hot = lead.is_hot ? "HOT LEAD · " : "";
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#0B2148">
    ${lead.is_hot ? '<p style="display:inline-block;background:#E5763B;color:#fff;font-weight:700;font-size:12px;padding:4px 8px;border-radius:4px">HOT LEAD · call first</p>' : ""}
    <h2 style="margin:8px 0">${esc(lead.full_name)}, ${esc(lead.company)}</h2>
    <p><b>Interested in:</b> ${esc(lead.interestLabels.join(", ") || "Not specified")}<br>
    <b>Phone / WhatsApp:</b> ${esc(lead.phone)}<br>
    <b>Email:</b> ${esc(lead.email)}<br>
    <b>Source:</b> ${esc(TOUCHPOINTS[lead.source] || lead.source)}<br>
    <b>Entry:</b> ${esc(lead.entry_no)}</p>
    <p>Call before 10:00 tomorrow. <a href="${siteUrl()}/admin">Open the admin page</a></p>
  </div>`;
  return send({
    to,
    subject: `${hot}${lead.full_name} (${lead.company}) – ${EVENT.name} lead`,
    html,
    text: `${hot}${lead.full_name}, ${lead.company}\n${lead.phone} · ${lead.email}\nInterests: ${lead.interestLabels.join(", ")}\nSource: ${lead.source}\nEntry: ${lead.entry_no}`,
  });
}
