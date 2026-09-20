import { NextResponse } from "next/server";
import { describeDatabaseUrl, resolveDatabaseUrl } from "@/lib/db-env";

// Tillfällig felsökningsendpoint för att se om/vilken databas-URL som
// faktiskt hittas på den körande driftsättningen. Lösenordet i URL:en
// är alltid dolt (****), så det är säkert att öppna i webbläsaren och
// dela texten. Ta bort filen när databaskopplingen är löst.
export async function GET() {
  const relevantEnvVarNames = Object.keys(process.env)
    .filter((key) => /DATABASE|POSTGRES|NEON/i.test(key))
    .sort();

  return NextResponse.json({
    runningOnVercel: process.env.VERCEL === "1",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    databaseFound: Boolean(resolveDatabaseUrl()),
    databaseUrlRedacted: describeDatabaseUrl(),
    relevantEnvVarNames,
  });
}
