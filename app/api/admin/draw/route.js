import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { ensureSchema, entryNo, sql } from "@/lib/db";
import { EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Picks one winner at random from every entry that has not already won.
// Each draw is recorded, so the history can be shown and audited.
export async function POST() {
  await ensureSchema();
  const db = sql();
  const pool = await db`SELECT id, full_name, company FROM leads WHERE id NOT IN (SELECT lead_id FROM draws) ORDER BY id`;
  if (!pool.length) return NextResponse.json({ error: "No eligible entries yet." }, { status: 409 });
  const winner = pool[randomInt(pool.length)];
  await db`INSERT INTO draws (lead_id) VALUES (${winner.id})`;
  return NextResponse.json({
    entryNo: entryNo(EVENT.entryPrefix, winner.id),
    name: winner.full_name,
    company: winner.company,
    poolSize: pool.length,
  });
}
