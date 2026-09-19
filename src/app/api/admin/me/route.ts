import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, readCookie, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getAdminConfig } from "@/lib/admin-db";

export async function GET(request: Request) {
  const token = readCookie(request.headers.get("cookie") || "", ADMIN_SESSION_COOKIE);
  const config = await getAdminConfig();
  if (!config || !(await verifyAdminSessionToken(token, config.sessionSecret))) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }
  return NextResponse.json({ email: config.email });
}
