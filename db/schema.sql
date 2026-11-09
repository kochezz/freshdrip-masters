-- freshDRIP Lusaka Masters lead capture schema (Neon / Postgres).
-- The app runs the same statements automatically on first use.
-- You can also paste this into the Neon SQL Editor.

CREATE TABLE IF NOT EXISTS leads (
  id              SERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name       TEXT NOT NULL,
  company         TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  interests       TEXT[] NOT NULL DEFAULT '{}',
  is_hot          BOOLEAN NOT NULL DEFAULT false,
  source          TEXT NOT NULL DEFAULT 'direct',
  consent_version TEXT NOT NULL,
  consent_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          TEXT NOT NULL DEFAULT 'new',
  notes           TEXT NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_uq ON leads (lower(email));

CREATE TABLE IF NOT EXISTS scans (
  id         BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source     TEXT NOT NULL DEFAULT 'direct'
);

CREATE TABLE IF NOT EXISTS draws (
  id         SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_id    INTEGER NOT NULL REFERENCES leads(id)
);
