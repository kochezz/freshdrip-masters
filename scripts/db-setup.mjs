// Optional: creates the tables ahead of time. The app also creates them
// automatically on first use, so you only need this to check the connection.
//   DATABASE_URL="postgresql://..." npm run db:setup
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const statements = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .split(/;\s*$/m)
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith("--"));
for (const s of statements) await sql.query(s);
const [{ n }] = await sql`SELECT count(*)::int AS n FROM leads`;
console.log(`Database ready. Leads stored: ${n}`);
