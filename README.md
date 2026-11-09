# freshDRIP at the Lusaka Masters

Lead capture for Vilagio Trading Limited (VTL) at the Lusaka Masters, 16–22 November 2026.

Guests scan a QR code on a cocktail table card, a freshDRIP LUX neck tag or the sales stand. They enter the prize draw (water dispenser, 5-gallon freshDRIP and a case of freshDRIP LUX) and download the VTL Company Profile and Sales Catalogue. VTL gets an instant email alert for every lead and a password-protected admin page to follow up, export to the ERP and run the draw.

**Stack:** Next.js 14 on Vercel · Neon Postgres · Resend for email · short.io for the QR short links.

---

## Contents

1. [How it works](#how-it-works)
2. [Go-live checklist](#go-live-checklist)
3. [Step 1: Neon database](#step-1-neon-database)
4. [Step 2: Vercel environment variables](#step-2-vercel-environment-variables)
5. [Step 3: Email with Resend](#step-3-email-with-resend)
6. [Step 4: Short links with short.io](#step-4-short-links-with-shortio)
7. [Step 5: QR codes for the printer](#step-5-qr-codes-for-the-printer)
8. [Step 6: Test before the cocktail](#step-6-test-before-the-cocktail)
9. [Running the event](#running-the-event)
10. [Changing text, prize or PDFs](#changing-text-prize-or-pdfs)
11. [Data protection](#data-protection)
12. [Local development](#local-development)
13. [Project structure](#project-structure)

---

## How it works

```
QR on card / tag / stand
  → short.io link (e.g. go.vilagio.co.zm/table)
    → https://<app>/?src=table
      → Welcome → Form (4 fields + interests + consent) → Done (entry number + PDFs)
        → saved in Neon, tagged with the touchpoint
        → email to the guest with both PDFs
        → alert email to the lead owner (marked HOT where relevant)
          → /admin: status, CSV export, prize draw
```

| Page / route | What it does |
| --- | --- |
| `/` | Guest journey. Reads `?src=table`, `tag` or `stand` to know which printed piece was scanned. |
| `/admin` | Leads, KPIs, leads and scans per touchpoint, status updates, delete, prize draw. Password-protected. |
| `/api/admin/export` | CSV of all leads, for the VTL ERP or Excel. |
| `/api/vcard` | "Save VTL to my contacts" card. |
| `/downloads/*.pdf` | Company Profile (1.7 MB) and Sales Catalogue (1.3 MB, compressed from 6.8 MB). |

A lead is **hot** when the guest ticks *Mine & site supply* or *Co-branded water*. One entry is allowed per email address; a repeat submission keeps the same entry number.

The database tables are created automatically the first time the app runs. No manual SQL is needed.

---

## Go-live checklist

| # | Task | Who | Status |
| --- | --- | --- | --- |
| 1 | Code pushed to GitHub (`kochezz/freshdrip-masters`) | Claude | Done |
| 2 | Vercel project connected to the GitHub repo | Kochez | ☐ |
| 3 | Neon connection string added to Vercel as `DATABASE_URL` | Kochez | ☐ |
| 4 | `ADMIN_PASSWORD` and `SITE_URL` added to Vercel | Kochez | ☐ |
| 5 | Redeploy, then open `/admin` and sign in | Kochez | ☐ |
| 6 | Resend key and sender added (emails) | Kochez | ☐ |
| 7 | short.io domain connected and 3 links created | Kochez | ☐ |
| 8 | QR codes generated from the short links and sent to the printer | VTL | ☐ by **11 Nov** |
| 9 | Phone test on Airtel, MTN and Zamtel, test entries deleted | VTL | ☐ by **14 Nov** |

---

## Step 1: Neon database

1. Open the Neon project (**ancient-wildflower-57436543**).
2. Click **Connect** at the top of the dashboard.
3. Keep the branch as **main** (or the branch shown), database **neondb**, and turn **Connection pooling** on.
4. Copy the connection string. It looks like:
   `postgresql://neondb_owner:xxxx@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
5. Keep it private. It goes into Vercel in the next step and nowhere else.

**Region:** Neon stores the data in the region the project was created in (shown on the dashboard). See [Data protection](#data-protection).

> Shortcut: Vercel → your project → **Storage** → **Connect Database** → Neon can also add `DATABASE_URL` for you. Either route works; don't do both.

---

## Step 2: Vercel environment variables

1. Open **Vercel → kochezzs-projects → freshdrip-masters**.
2. If the project isn't linked to GitHub yet: **Settings → Git → Connect Git Repository** → `kochezz/freshdrip-masters`, branch `main`. Framework preset: **Next.js** (auto-detected). No build settings need changing.
3. Go to **Settings → Environment Variables** and add these for **Production** and **Preview**:

| Name | Value | Required |
| --- | --- | --- |
| `DATABASE_URL` | Neon connection string from Step 1 | Yes |
| `ADMIN_PASSWORD` | A long password for `/admin` | Yes |
| `SITE_URL` | `https://freshdrip-masters.vercel.app` (or your custom domain), no trailing slash | Yes |
| `RESEND_API_KEY` | From Step 3 | For email |
| `EMAIL_FROM` | `freshDRIP <hello@yourdomain>` once verified, else `freshDRIP <onboarding@resend.dev>` | For email |
| `LEAD_ALERT_EMAIL` | Who receives lead alerts, comma-separated | For email |
| `CONTACT_NAME` | `Emmanuel Zulu` | Optional |
| `CONTACT_PHONE` | `+260970850065` | Optional |
| `CONTACT_EMAIL` | Emmanuel's email | Optional |

4. Go to **Deployments**, open the latest one, click **⋯ → Redeploy**. Environment variables only take effect after a redeploy.
5. Open `https://<your-app>/admin`. Your browser asks for a username and password: any username (e.g. `vtl`) and the `ADMIN_PASSWORD`. You should see "No leads yet".

If `/admin` says **"Can't reach the database"**, the `DATABASE_URL` is missing or wrong. If it says **"Admin is locked"**, `ADMIN_PASSWORD` is missing.

---

## Step 3: Email with Resend

The app works without email (leads still save), but the alert and the guest's PDF email both need it.

1. Create a free account at [resend.com](https://resend.com) (3,000 emails a month, 100 a day).
2. **API Keys → Create API key** (sending access). Put it in Vercel as `RESEND_API_KEY`.
3. **Domains → Add domain**, e.g. `vilagio.co.zm` or a subdomain like `mail.vilagio.co.zm`. Add the DNS records Resend shows at your domain registrar and wait until it says **Verified**.
4. Set `EMAIL_FROM` to an address on that domain, e.g. `freshDRIP <hello@vilagio.co.zm>`, then redeploy.

> **Important:** until a domain is verified, Resend only delivers to the email address that owns the Resend account. Guests will not receive their PDF email. Verify the domain before the cocktail.

> **Check the alert address.** `LEAD_ALERT_EMAIL` defaults to `ezulu@vilag.io` from the sponsorship letter. Confirm that domain is correct (not `vilagio...`), or alerts will go nowhere.

---

## Step 4: Short links with short.io

Every printed QR points at a short link, never straight at Vercel. If the app ever moves, you change the link in short.io and the printed cards keep working.

1. In short.io, **Domains → Connect**. Either:
   - use a subdomain you own, e.g. `go.vilagio.co.zm` (add the DNS record short.io gives you at your registrar), or
   - use a free short.io domain for now.
2. Create three links:

| Short link | Destination | Printed on |
| --- | --- | --- |
| `go.vilagio.co.zm/table` | `https://<your-app>/?src=table` | Cocktail table cards |
| `go.vilagio.co.zm/tag` | `https://<your-app>/?src=tag` | freshDRIP LUX neck tags |
| `go.vilagio.co.zm/stand` | `https://<your-app>/?src=stand` | Sales stand poster |

3. Optionally create `go.vilagio.co.zm/win` → `https://<your-app>/?src=table` as the human-readable link printed under the QR on the card.

short.io's own dashboard counts clicks per link; the admin page counts scans that loaded the app. The two numbers should be close.

---

## Step 5: QR codes for the printer

Generate the codes from the **short links**, in freshDRIP navy, as SVG for print and PNG for previews:

```bash
npm install
npm run qr -- table=https://go.vilagio.co.zm/table tag=https://go.vilagio.co.zm/tag stand=https://go.vilagio.co.zm/stand
```

Files appear in `qr/`. Give the printer the `.svg` files.

Print rules:
- At least **2 cm** wide on the table card, with a white border around it (the files already include one).
- Print the short link as text under the QR, for phones that won't scan.
- Test-scan a printed proof in dim light before the full run.

---

## Step 6: Test before the cocktail

Do this on **13–14 November** with real phones.

- [ ] Scan each printed QR (table, tag, stand) on at least 10 phones across Airtel, MTN and Zamtel.
- [ ] The welcome screen loads in under 3 seconds on mobile data.
- [ ] Submit a test entry from each touchpoint. Check `/admin` shows the right source.
- [ ] The lead alert email arrives within a minute and shows HOT for mine/co-branded.
- [ ] The guest email arrives with both PDF links working.
- [ ] Both PDFs open on iPhone and Android.
- [ ] "Save VTL to my contacts" adds the contact.
- [ ] Submitting the same email twice returns the same entry number.
- [ ] **Delete every test entry in `/admin`** (✕ on each row) so none can win the draw.

---

## Running the event

**Every evening:** open `/admin`. Hot leads and uncalled leads sort to the top. Set each lead's status as you go: *New → Called → Quoted → Won / Lost*. Leads should be called by **10:00 the next morning**.

**Prize draw (22 November):** in `/admin`, click **Draw a winner → Yes, draw now**. It picks at random from every entry that hasn't already won and records the result with a timestamp. Draw again for a runner-up if the winner can't be reached.

**After the event:** **Download CSV** and import the leads into the VTL ERP sales records.

---

## Changing text, prize or PDFs

All wording lives in [`lib/config.js`](lib/config.js): event name, draw date, prize headline and items, interest options (and which are hot), consent text, download titles and the contact person. Edit on GitHub, commit to `main`, and Vercel redeploys in about a minute.

- **Swap a PDF:** replace the file in `public/downloads/` keeping the same filename, or update `href` and `size` in `lib/config.js`. Keep each under 5 MB.
- **Swap the bottle image:** replace `public/bottle.webp` (keep it on a white background and under ~100 KB).
- **Branding:** the event is shown as "Lusaka Masters". Only change it to Zanaco branding with written approval from the organising committee and Zanaco.

---

## Data protection

This is not legal advice; confirm VTL's obligations with a Zambian data protection adviser.

- Guests tick an explicit consent box. Each lead stores the consent wording version (`CONSENT.version` in `lib/config.js`) and the time it was given. Bump the version if you change the wording.
- Only the data needed is collected: name, company, phone, email and interests. No IP address or device data is stored.
- Neon and Vercel store and process data outside Zambia unless configured otherwise. Zambia's Data Protection Act, 2021 restricts transfers abroad without consent; check whether VTL must register as a data controller with the Data Protection Commissioner and whether the consent wording should mention storage abroad.
- If someone asks to be removed, delete their row in `/admin` and reply to confirm.
- The admin page is behind a password. Share it only with the people following up leads, and change it after the event.

---

## Local development

```bash
cp .env.example .env.local   # fill in DATABASE_URL and ADMIN_PASSWORD
npm install
npm run dev                  # http://localhost:3000/?src=table
```

`npm run db:setup` checks the database connection and creates the tables (optional; the app does this itself).

---

## Project structure

```
app/
  page.js                  Guest page (reads ?src=)
  Journey.jsx              Welcome → Form → Done screens
  admin/                   Admin page and its buttons
  api/leads/               Saves a lead, sends emails
  api/scan/                Counts scans per touchpoint
  api/vcard/               Contact card
  api/admin/               Status updates, delete, CSV export, prize draw
lib/
  config.js                All editable text and options
  db.js                    Neon connection and automatic table setup
  email.js                 Guest email and lead alert (Resend)
db/schema.sql              Same tables as SQL, for the Neon SQL Editor
middleware.js              Password protection for /admin
public/                    Bottle image and the two PDFs
scripts/make-qr.mjs        QR code generator
```
