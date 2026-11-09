import { neon } from "@neondatabase/serverless";
import { unstable_noStore as noStore } from "next/cache";

let _sql = null;
let _ready = null;

export function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables.");
  }
  // Never let Next.js cache database reads: the Neon driver talks over
  // fetch(), which Next.js caches by default, freezing the admin page.
  noStore();
  if (!_sql) _sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: "no-store" } });
  return _sql;
}

// Creates the tables on first use, so no manual database step is required.
// Safe to run repeatedly.
export async function ensureSchema() {
  if (_ready) return _ready;
  const db = sql();
  _ready = (async () => {
    await db`CREATE TABLE IF NOT EXISTS leads (
      id            SERIAL PRIMARY KEY,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      full_name     TEXT NOT NULL,
      company       TEXT NOT NULL,
      phone         TEXT NOT NULL,
      email         TEXT NOT NULL,
      interests     TEXT[] NOT NULL DEFAULT '{}',
      is_hot        BOOLEAN NOT NULL DEFAULT false,
      source        TEXT NOT NULL DEFAULT 'direct',
      consent_version TEXT NOT NULL,
      consent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      status        TEXT NOT NULL DEFAULT 'new',
      notes         TEXT NOT NULL DEFAULT '',
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await db`CREATE UNIQUE INDEX IF NOT EXISTS leads_email_uq ON leads (lower(email))`;
    await db`CREATE TABLE IF NOT EXISTS scans (
      id         BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      source     TEXT NOT NULL DEFAULT 'direct'
    )`;
    await db`CREATE TABLE IF NOT EXISTS draws (
      id         SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      lead_id    INTEGER NOT NULL REFERENCES leads(id)
    )`;
  })().catch((e) => {
    _ready = null;
    throw e;
  });
  return _ready;
}

export function entryNo(prefix, id) {
  return `${prefix}-${String(id).padStart(4, "0")}`;
}
