import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { touchpointKey } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    await ensureSchema();
    await sql()`INSERT INTO scans (source) VALUES (${touchpointKey(body.src)})`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("scan", e?.message);
    return NextResponse.json({ ok: false }, { status: 200 }); // never block the guest
  }
}
