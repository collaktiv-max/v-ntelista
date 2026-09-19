import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/admin-auth";
import { getStorageProblem } from "@/lib/db-env";

export async function GET() {
  const storageProblem = getStorageProblem();
  if (storageProblem) {
    return NextResponse.json({ error: storageProblem }, { status: 503 });
  }
  try {
    return NextResponse.json({ configured: await isAdminConfigured() });
  } catch (err) {
    return NextResponse.json(
      { error: `Databasfel: ${err instanceof Error ? err.message : "okänt fel"}` },
      { status: 500 }
    );
  }
}
