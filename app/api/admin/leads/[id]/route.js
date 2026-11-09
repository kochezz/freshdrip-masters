import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { STATUSES } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function PATCH(req, { params }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  }
  await ensureSchema();
  const db = sql();
  if (body.status !== undefined) await db`UPDATE leads SET status = ${body.status}, updated_at = now() WHERE id = ${id}`;
  if (body.notes !== undefined) await db`UPDATE leads SET notes = ${String(body.notes).slice(0, 2000)}, updated_at = now() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

// Removes a lead entirely (use for test entries, or when someone asks to be
// deleted under the Data Protection Act).
export async function DELETE(req, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  await ensureSchema();
  const db = sql();
  await db`DELETE FROM draws WHERE lead_id = ${id}`;
  await db`DELETE FROM leads WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
