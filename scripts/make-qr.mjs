// Generates print-ready QR codes (SVG for the printer, PNG for previews).
//
// Usage:
//   npm run qr -- table=https://go.example.com/table tag=https://go.example.com/tag stand=https://go.example.com/stand
//
// Each argument is name=url. Output goes to ./qr/. Always point QR codes at
// your short.io links, never straight at the Vercel URL, so the destination
// can change without reprinting.
import QRCode from "qrcode";
import { mkdirSync, writeFileSync } from "fs";

const pairs = process.argv.slice(2).map((a) => a.split(/=(.+)/)).filter(([n, u]) => n && u);
if (!pairs.length) {
  console.error("Give at least one name=url pair, e.g. npm run qr -- table=https://go.example.com/table");
  process.exit(1);
}
mkdirSync("qr", { recursive: true });
const opts = { errorCorrectionLevel: "Q", margin: 4, color: { dark: "#123A73", light: "#FFFFFF" } };
for (const [name, url] of pairs) {
  writeFileSync(`qr/${name}.svg`, await QRCode.toString(url, { ...opts, type: "svg" }));
  await QRCode.toFile(`qr/${name}.png`, url, { ...opts, width: 1200 });
  console.log(`qr/${name}.svg  qr/${name}.png  →  ${url}`);
}
