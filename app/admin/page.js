import { ensureSchema, entryNo, sql } from "@/lib/db";
import { EVENT, INTERESTS, STATUSES, TOUCHPOINTS } from "@/lib/config";
import { LeadRow, DrawButton } from "./AdminClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads · freshDRIP admin" };

export default async function Admin() {
  let leads = [], scans = [], draws = [], error = null;
  try {
    await ensureSchema();
    const db = sql();
    [leads, scans, draws] = await Promise.all([
      db`SELECT * FROM leads ORDER BY is_hot DESC, (status = 'new') DESC, created_at DESC`,
      db`SELECT source, count(*)::int AS n FROM scans GROUP BY source`,
      db`SELECT d.created_at, l.id, l.full_name, l.company FROM draws d JOIN leads l ON l.id = d.lead_id ORDER BY d.created_at DESC`,
    ]);
  } catch (e) {
    error = e.message;
  }

  const label = Object.fromEntries(INTERESTS.map((i) => [i.key, i.label]));
  const scanBy = Object.fromEntries(scans.map((s) => [s.source, s.n]));
  const totalScans = scans.reduce((a, s) => a + s.n, 0);
  const hot = leads.filter((l) => l.is_hot).length;
  const uncalled = leads.filter((l) => l.status === "new").length;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const leadBy = {};
  leads.forEach((l) => (leadBy[l.source] = (leadBy[l.source] || 0) + 1));
  const maxLead = Math.max(1, ...Object.values(leadBy));

  return (
    <div className="admin-page">
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <img className="admin-logo" src="/vilagio-logo.webp" alt="Vilagio Trading Limited" width="520" height="359" />
            <span className="eyebrow">freshDRIP admin</span>
            <h1>{EVENT.name} leads</h1>
          </div>
          <div className="actions">
            <a className="btn" href="/admin">Refresh</a>
            <a className="btn primary" href="/api/admin/export">Download CSV</a>
          </div>
        </div>

        {error && (
          <div className="panel empty">
            <b>Can't reach the database.</b>
            <br />
            {error}
          </div>
        )}

        <div className="panel kpis">
          <div className="kpi"><span>Scans</span><b>{totalScans}</b><i>all touchpoints</i></div>
          <div className="kpi"><span>Leads</span><b>{leads.length}</b><i>{pct(leads.length, totalScans)}% of scans</i></div>
          <div className="kpi"><span>Hot</span><b>{hot}</b><i>{pct(hot, leads.length)}% of leads</i></div>
          <div className={`kpi${uncalled ? " alert" : ""}`}><span>Not yet called</span><b>{uncalled}</b><i>call by 10:00</i></div>
          <div className="kpi"><span>Won</span><b>{leads.filter((l) => l.status === "won").length}</b><i>orders</i></div>
        </div>

        <div className="split">
          <div className="panel tbl">
            {leads.length === 0 ? (
              <p className="empty">No leads yet. Entries appear here as soon as guests submit the form.</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Entry</th><th>Lead</th><th>Contact</th><th>Interest</th><th>Source</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <LeadRow
                      key={l.id}
                      statuses={STATUSES}
                      lead={{
                        id: l.id,
                        entry: entryNo(EVENT.entryPrefix, l.id),
                        name: l.full_name,
                        company: l.company,
                        phone: l.phone,
                        email: l.email,
                        hot: l.is_hot,
                        interests: (l.interests || []).map((k) => label[k] || k).join(", "),
                        source: TOUCHPOINTS[l.source] || l.source,
                        status: l.status,
                        when: new Date(l.created_at).toLocaleString("en-GB", { timeZone: "Africa/Lusaka", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
                      }}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="panel side">
            <h2>By touchpoint</h2>
            {Object.entries(TOUCHPOINTS).map(([k, name]) => (
              <div className="bar" key={k}>
                <div className="row">
                  <span>{name}</span>
                  <b>{leadBy[k] || 0} leads · {scanBy[k] || 0} scans</b>
                </div>
                <div className="track"><div className="fill" style={{ width: `${((leadBy[k] || 0) / maxLead) * 100}%` }} /></div>
              </div>
            ))}
            <h2 style={{ marginTop: 8 }}>Prize draw</h2>
            <p className="muted" style={{ margin: 0, fontSize: ".84rem" }}>
              Picks one entry at random from everyone who hasn't already won. Delete test entries first.
            </p>
            <DrawButton />
            {draws.map((d) => (
              <div className="winner" key={d.created_at}>
                <span className="eyebrow">Drawn {new Date(d.created_at).toLocaleString("en-GB", { timeZone: "Africa/Lusaka" })}</span>
                <b>{d.full_name}</b>
                {d.company} · {entryNo(EVENT.entryPrefix, d.id)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
