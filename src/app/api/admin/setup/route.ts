import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminAccount, isAdminConfigured } from "@/lib/admin-auth";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  if (await isAdminConfigured()) {
    return NextResponse.json(
      { error: "Ett adminkonto finns redan. Logga in istället." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Ange en giltig e-postadress." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Lösenordet måste vara minst 8 tecken." },
      { status: 400 }
    );
  }

  const token = await createAdminAccount(email, password);
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
