import { NextResponse } from "next/server";

// Tillfällig felsökningsendpoint för att se VILKA databas-relaterade
// miljövariabler som finns på den körande driftsättningen – inga värden,
// bara namnen, så den är säker att öppna i webbläsaren. Ta bort filen när
// databaskopplingen är löst.
export async function GET() {
  const relevantEnvVarNames = Object.keys(process.env)
    .filter((key) => /DATABASE|POSTGRES|NEON/i.test(key))
    .sort();

  return NextResponse.json({
    runningOnVercel: process.env.VERCEL === "1",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    relevantEnvVarNames,
  });
}
