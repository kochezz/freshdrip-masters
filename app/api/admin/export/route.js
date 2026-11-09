import { ensureSchema, entryNo, sql } from "@/lib/db";
import { EVENT, INTERESTS, TOUCHPOINTS } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const cell = (v) => {
  const s = String(v ?? "");
  // Neutralise spreadsheet formulas and quote every cell.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM leads ORDER BY created_at`;
  const label = Object.fromEntries(INTERESTS.map((i) => [i.key, i.label]));
  const header = ["Entry", "Created", "Name", "Company", "Phone", "Email", "Interests", "Hot", "Source", "Status", "Notes", "Consent version"];
  const lines = rows.map((r) =>
    [
      entryNo(EVENT.entryPrefix, r.id),
      new Date(r.created_at).toISOString(),
      r.full_name,
      r.company,
      r.phone,
      r.email,
      (r.interests || []).map((k) => label[k] || k).join("; "),
      r.is_hot ? "Yes" : "No",
      TOUCHPOINTS[r.source] || r.source,
      r.status,
      r.notes,
      r.consent_version,
    ].map(cell).join(",")
  );
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lusaka-masters-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
