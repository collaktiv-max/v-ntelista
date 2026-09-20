// Vercels Postgres-integration (Neon) sätter oftast DATABASE_URL, men
// beroende på hur databasen kopplades in kan namnet skilja sig
// (POSTGRES_URL, DATABASE_URL_UNPOOLED, eller ett eget prefix som
// STORAGE_DATABASE_URL om ni valde ett anpassat prefix vid kopplingen).
// Kolla de vanligaste namnen först, och om inget av dem finns – leta
// efter VILKEN miljövariabel som helst vars namn slutar på
// "DATABASE_URL"/"POSTGRES_URL" och vars värde faktiskt ser ut som en
// Postgres-anslutningssträng.
const PREFERRED_NAMES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PRISMA_URL",
];

function looksLikePostgresUrl(value: string | undefined): value is string {
  return !!value && /^postgres(ql)?:\/\//i.test(value);
}

let cachedUrl: string | undefined | null = null;

export function resolveDatabaseUrl(): string | undefined {
  if (cachedUrl !== null) return cachedUrl ?? undefined;

  for (const name of PREFERRED_NAMES) {
    const value = process.env[name];
    if (looksLikePostgresUrl(value)) {
      cachedUrl = value;
      return value;
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (/(DATABASE_URL|POSTGRES_URL)$/i.test(key) && looksLikePostgresUrl(value)) {
      cachedUrl = value;
      return value;
    }
  }

  cachedUrl = undefined;
  return undefined;
}

// En säker, redigerad version (lösenordet dolt) av den hittade
// anslutningssträngen – bra för att felsöka utan att läcka hemligheter.
export function describeDatabaseUrl(): string | null {
  const url = resolveDatabaseUrl();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = "****";
    return parsed.toString();
  } catch {
    return "(kunde inte tolkas som en giltig URL)";
  }
}

// Körs vi på Vercel (VERCEL sätts alltid där) utan att databasen hittades?
// Då är fil-fallbacken i waitlist-db/admin-db dömd att misslyckas
// (skrivskyddat filsystem på Vercel), så vi vill hellre visa ett tydligt
// fel än låta det krascha oförklarat.
export function getStorageProblem(): string | null {
  if (resolveDatabaseUrl()) return null;
  if (process.env.VERCEL) {
    return "Databasen är inte kopplad till den här driftsättningen. Kontrollera i Vercel under Storage att databasen är kopplad till projektet, och kör sedan Redeploy på senaste deployen (Deployments → ⋯ → Redeploy) – miljövariabeln läses bara in vid en ny driftsättning.";
  }
  return null;
}
