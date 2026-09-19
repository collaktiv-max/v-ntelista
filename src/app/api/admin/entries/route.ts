import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, readCookie, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getAllWaitlistEntries } from "@/lib/waitlist-db";

export async function GET(request: Request) {
  const token = readCookie(request.headers.get("cookie") || "", ADMIN_SESSION_COOKIE);
  if (!(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const entries = await getAllWaitlistEntries();
  return NextResponse.json({ entries });
}
