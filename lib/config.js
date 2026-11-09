// Everything a non-developer might want to change lives in this file.

export const EVENT = {
  name: "Lusaka Masters",
  year: 2026,
  drawDate: "22 November",
  entryPrefix: "LM",
};

export const PRIZE = {
  headline: "Win a freshDRIP water station for your office",
  items: ["Water dispenser", "5-gallon freshDRIP", "Case of freshDRIP LUX"],
};

// Each printed piece gets its own short link ending in ?src=<key>.
export const TOUCHPOINTS = {
  table: "Cocktail table card",
  tag: "LUX bottle neck tag",
  stand: "Sales stand",
  direct: "Direct / unknown",
};

export function touchpointKey(raw) {
  const k = String(raw || "").toLowerCase().trim();
  return Object.prototype.hasOwnProperty.call(TOUCHPOINTS, k) ? k : "direct";
}

// Interest options shown as tap chips. `hot: true` marks the lead as hot.
export const INTERESTS = [
  { key: "office", label: "Office supply", hot: false },
  { key: "mine", label: "Mine & site supply", hot: true },
  { key: "events", label: "Events & hospitality", hot: false },
  { key: "cobrand", label: "Co-branded water", hot: true },
  { key: "retail", label: "Retail & distribution", hot: false },
];

export const STATUSES = ["new", "called", "quoted", "won", "lost"];

// Bump the version whenever the consent wording changes; each lead stores
// the version it agreed to.
export const CONSENT = {
  version: "2026-11-v1",
  text:
    "I agree that Vilagio Trading Limited may contact me about freshDRIP products and store my details for that purpose. I can opt out at any time.",
};

export const DOWNLOADS = [
  {
    key: "profile",
    title: "Company Profile",
    note: "Who VTL is",
    href: "/downloads/VTL-Company-Profile-2026.pdf",
    size: "1.7 MB",
  },
  {
    key: "catalogue",
    title: "Sales Catalogue",
    note: "freshDRIP & LUX range",
    href: "/downloads/freshDRIP-Sales-Catalogue-2026.pdf",
    size: "1.3 MB",
  },
];

export const COMPANY = {
  name: "Vilagio Trading Limited",
  address: "Plot 28441, 50/50, Kitwe Road, Chingola, Zambia",
};

export function contact() {
  return {
    name: process.env.CONTACT_NAME || "Emmanuel Zulu",
    phone: process.env.CONTACT_PHONE || "+260970850065",
    email: process.env.CONTACT_EMAIL || "ezulu@vilag.io",
  };
}
