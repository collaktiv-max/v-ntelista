import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, readCookie, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getAdminConfig } from "@/lib/admin-db";
import { getAllWaitlistEntries } from "@/lib/waitlist-db";

export async function GET(request: Request) {
  try {
    const token = readCookie(request.headers.get("cookie") || "", ADMIN_SESSION_COOKIE);
    const config = await getAdminConfig();
    if (!config || !(await verifyAdminSessionToken(token, config.sessionSecret))) {
      return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
    }

    const entries = await getAllWaitlistEntries();
    return NextResponse.json({ entries });
  } catch (err) {
    return NextResponse.json(
      { error: `Databasfel: ${err instanceof Error ? err.message : "okänt fel"}` },
      { status: 500 }
    );
  }
}
