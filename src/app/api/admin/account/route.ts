import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  readCookie,
  updateAdminAccount,
  verifyAdminSessionToken,
  verifyPasswordHash,
} from "@/lib/admin-auth";
import { getAdminConfig } from "@/lib/admin-db";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  const token = readCookie(request.headers.get("cookie") || "", ADMIN_SESSION_COOKIE);
  const config = await getAdminConfig();
  if (!config || !(await verifyAdminSessionToken(token, config.sessionSecret))) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { currentPassword, newEmail, newPassword } = (body ?? {}) as Record<string, unknown>;

  if (typeof currentPassword !== "string" || !(await verifyPasswordHash(currentPassword, config.passwordHash))) {
    return NextResponse.json({ error: "Fel nuvarande lösenord." }, { status: 401 });
  }
  if (typeof newEmail !== "string" || !EMAIL_RE.test(newEmail.trim())) {
    return NextResponse.json({ error: "Ange en giltig e-postadress." }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Det nya lösenordet måste vara minst 8 tecken." },
      { status: 400 }
    );
  }

  await updateAdminAccount(newEmail, newPassword);
  return NextResponse.json({ ok: true });
}
