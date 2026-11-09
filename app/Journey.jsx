"use client";

import { useEffect, useRef, useState } from "react";

export default function Journey({ src, event, prize, interests, consent, downloads }) {
  const [view, setView] = useState("welcome");
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", website: "" });
  const [picked, setPicked] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const top = useRef(null);

  // Count the scan once per browser session.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("fd-scan")) return;
      sessionStorage.setItem("fd-scan", "1");
    } catch {}
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src }),
      keepalive: true,
    }).catch(() => {});
  }, [src]);

  useEffect(() => {
    top.current?.scrollIntoView({ block: "start" });
  }, [view]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your name.";
    if (form.company.trim().length < 2) e.company = "Enter your company.";
    if (form.phone.replace(/\D/g, "").length < 9) e.phone = "Enter a number with at least 9 digits.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter an email like name@company.com.";
    if (!agreed) e.consent = "Tick the box so we can contact you.";
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, interests: picked, consent: agreed, src }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
      } else if (!res.ok) {
        setErrors({ form: data.error || "We couldn't save your entry. Please try again." });
      } else {
        setResult(data);
        setView("done");
      }
    } catch {
      setErrors({ form: "No connection. Check your signal and tap Submit again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell" ref={top}>
      {view === "welcome" && (
        <section className="view v-welcome">
          <Brand right={`LUX · ${event.name}`} />
          <div className="bottle">
            <img src="/bottle.webp" alt="freshDRIP spring water bottle" width="210" height="720" fetchPriority="high" />
          </div>
          <span className="kicker">Chairman's Cocktail draw</span>
          <h1 className="prize">{renderHeadline(prize.headline)}</h1>
          <div className="prizes">
            {prize.items.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
          <p className="sub">Drawn at the prize-giving on {event.drawDate}. Takes 30 seconds.</p>
          <button className="cta" onClick={() => setView("form")}>
            Enter the draw
          </button>
          <Maker />
        </section>
      )}

      {view === "form" && (
        <section className="view v-form">
          <Brand right="Entry" dark />
          <div className="steps" aria-hidden="true">
            <i className="on" />
            <i className="on" />
            <i />
          </div>
          <h2>Your details</h2>
          <form onSubmit={submit} noValidate>
            <Field id="name" label="Full name" value={form.name} onChange={set("name")} error={errors.name} autoComplete="name" />
            <Field id="company" label="Company" value={form.company} onChange={set("company")} error={errors.company} autoComplete="organization" />
            <Field id="phone" label="WhatsApp number" type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" placeholder="+260 97 000 0000" />
            <Field id="email" label="Email" type="email" inputMode="email" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" />
            <div className="hp" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
            </div>
            <p className="q">
              What could freshDRIP do for you? <span>Tap any</span>
            </p>
            <div className="pick">
              {interests.map((i) => (
                <button
                  type="button"
                  key={i.key}
                  aria-pressed={picked.includes(i.key)}
                  className={i.hot ? "hot" : ""}
                  onClick={() => toggle(i.key)}
                >
                  {i.label}
                </button>
              ))}
            </div>
            <label className="consent" htmlFor="consent">
              <input id="consent" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>{consent}</span>
            </label>
            {errors.consent && <span className="err">{errors.consent}</span>}
            {errors.form && <p className="err form-err" role="alert">{errors.form}</p>}
            <button className="cta" type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Submit entry"}
            </button>
            <button type="button" className="back" onClick={() => setView("welcome")}>
              Back
            </button>
          </form>
          <Maker />
        </section>
      )}

      {view === "done" && result && (
        <section className="view v-done">
          <Brand right="Entered" />
          <div className="tick" aria-hidden="true">✓</div>
          <h2>
            {result.repeat ? "You're already in the draw" : "You're in the draw"}, {result.firstName}.
          </h2>
          <p className="sub">
            We'll announce the winner of the water station at the prize-giving on {event.drawDate}. Your downloads are below and on their way to your email.
          </p>
          <div className="ticket">
            <span>Entry no.</span>
            <b>{result.entryNo}</b>
          </div>
          <div className="dl">
            {downloads.map((d) => (
              <a key={d.key} href={d.href} target="_blank" rel="noopener">
                <span className="ic">PDF</span>
                <span>
                  {d.title}
                  <small>
                    {d.note} · {d.size}
                  </small>
                </span>
              </a>
            ))}
          </div>
          <a className="ghost" href="/api/vcard">
            Save VTL to my contacts
          </a>
          <Maker light />
        </section>
      )}
    </main>
  );
}

function renderHeadline(text) {
  const i = text.indexOf("freshDRIP");
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <em>freshDRIP</em>
      {text.slice(i + 9)}
    </>
  );
}

function Maker({ light }) {
  return (
    <div className={`maker${light ? " light" : ""}`}>
      <span>A product of</span>
      <img
        src={light ? "/vilagio-logo-light.webp" : "/vilagio-logo.webp"}
        alt="Vilagio Trading Limited"
        width="520"
        height="359"
        loading="eager"
      />
      <span>Vilagio Trading Limited · Chingola, Zambia</span>
    </div>
  );
}

function Brand({ right, dark }) {
  return (
    <div className={`brand${dark ? " dark" : ""}`}>
      <span>
        fresh<b>DRIP</b>
      </span>
      <small>{right}</small>
    </div>
  );
}

function Field({ id, label, error, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} className={error ? "bad" : ""} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {error && (
        <span className="err" id={`${id}-err`}>
          {error}
        </span>
      )}
    </div>
  );
}
