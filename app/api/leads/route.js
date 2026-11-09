import { NextResponse } from "next/server";
import { ensureSchema, entryNo, sql } from "@/lib/db";
import { CONSENT, EVENT, INTERESTS, touchpointKey } from "@/lib/config";
import { sendGuestEmail, sendLeadAlert } from "@/lib/email";

export const dynamic = "force-dynamic";

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field.
  if (body.website) return NextResponse.json({ entryNo: `${EVENT.entryPrefix}-0000` });

  const lead = {
    full_name: clean(body.name, 120),
    company: clean(body.company, 160),
    phone: clean(body.phone, 40),
    email: clean(body.email, 200).toLowerCase(),
    source: touchpointKey(body.src),
  };
  const keys = Array.isArray(body.interests) ? body.interests : [];
  const picked = INTERESTS.filter((i) => keys.includes(i.key));
  lead.interests = picked.map((i) => i.key);
  lead.interestLabels = picked.map((i) => i.label);
  lead.is_hot = picked.some((i) => i.hot);

  const errors = {};
  if (lead.full_name.length < 2) errors.name = "Enter your name.";
  if (lead.company.length < 2) errors.company = "Enter your company.";
  if (lead.phone.replace(/\D/g, "").length < 9) errors.phone = "Enter a number with at least 9 digits.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.email = "Enter an email like name@company.com.";
  if (body.consent !== true) errors.consent = "Tick the box so we can contact you.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  try {
    await ensureSchema();
    const db = sql();
    // One entry per email address. A repeat submission updates the details
    // and returns the same entry number.
    const rows = await db`
      INSERT INTO leads (full_name, company, phone, email, interests, is_hot, source, consent_version)
      VALUES (${lead.full_name}, ${lead.company}, ${lead.phone}, ${lead.email}, ${lead.interests}, ${lead.is_hot}, ${lead.source}, ${CONSENT.version})
      ON CONFLICT ((lower(email))) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        company = EXCLUDED.company,
        phone = EXCLUDED.phone,
        interests = EXCLUDED.interests,
        is_hot = leads.is_hot OR EXCLUDED.is_hot,
        updated_at = now()
      RETURNING id, (xmax = 0) AS inserted`;
    const { id, inserted } = rows[0];
    lead.entry_no = entryNo(EVENT.entryPrefix, id);

    if (inserted) {
      await Promise.allSettled([sendGuestEmail(lead), sendLeadAlert(lead)]);
    }
    return NextResponse.json({ entryNo: lead.entry_no, firstName: lead.full_name.split(" ")[0], repeat: !inserted });
  } catch (e) {
    console.error("lead", e?.message);
    return NextResponse.json(
      { error: "We couldn't save your entry. Please check your connection and try again." },
      { status: 500 }
    );
  }
}
