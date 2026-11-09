import { NextResponse } from "next/server";

// Password-protects /admin and /api/admin with HTTP Basic Auth.
// Username: anything (e.g. "vtl"). Password: the ADMIN_PASSWORD env var.
export function middleware(req) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse("Admin is locked: set ADMIN_PASSWORD in Vercel and redeploy.", { status: 503 });
  }
  const header = req.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const decoded = atob(encoded);
      const given = decoded.slice(decoded.indexOf(":") + 1);
      if (safeEqual(given, password)) return NextResponse.next();
    } catch {}
  }
  return new NextResponse("Sign in required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="freshDRIP admin", charset="UTF-8"' },
  });
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
