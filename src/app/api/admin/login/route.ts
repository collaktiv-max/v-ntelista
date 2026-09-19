import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  checkAdminCredentials,
  createAdminSessionToken,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { getAdminConfig } from "@/lib/admin-db";
import { getStorageProblem } from "@/lib/db-env";

export async function POST(request: Request) {
  const storageProblem = getStorageProblem();
  if (storageProblem) {
    return NextResponse.json({ error: storageProblem }, { status: 503 });
  }

  try {
    if (!(await isAdminConfigured())) {
      return NextResponse.json(
        { error: "Inget adminkonto är skapat än. Skapa ett nedan." },
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

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !(await checkAdminCredentials(email, password))
    ) {
      return NextResponse.json({ error: "Fel e-post eller lösenord." }, { status: 401 });
    }

    const config = await getAdminConfig();
    const token = await createAdminSessionToken(email.trim().toLowerCase(), config!.sessionSecret);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: `Databasfel: ${err instanceof Error ? err.message : "okänt fel"}` },
      { status: 500 }
    );
  }
}
