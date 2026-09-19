import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  checkAdminCredentials,
  createAdminSessionToken,
  isAdminConfigured,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Adminkontot är inte konfigurerat än. Sätt ADMIN_EMAIL och ADMIN_PASSWORD i Vercel (Settings → Environment Variables) och driftsätt om.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !checkAdminCredentials(email, password)
  ) {
    return NextResponse.json({ error: "Fel e-post eller lösenord." }, { status: 401 });
  }

  const token = await createAdminSessionToken(email.trim().toLowerCase());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
