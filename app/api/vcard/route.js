import { COMPANY, contact } from "@/lib/config";

export const dynamic = "force-dynamic";

export function GET() {
  const c = contact();
  const parts = c.name.split(" ");
  const last = parts.length > 1 ? parts.pop() : "";
  const card = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${parts.join(" ")};;;`,
    `FN:${c.name}`,
    `ORG:${COMPANY.name} (freshDRIP)`,
    `TEL;TYPE=CELL:${c.phone}`,
    `EMAIL;TYPE=WORK:${c.email}`,
    `ADR;TYPE=WORK:;;${COMPANY.address};;;;`,
    "END:VCARD",
  ].join("\r\n");
  return new Response(card, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="freshDRIP-VTL.vcf"',
    },
  });
}
