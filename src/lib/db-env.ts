// Vercels Postgres-integration (Neon) brukar sätta DATABASE_URL, men vissa
// varianter/äldre kopplingar sätter POSTGRES_URL istället – kolla båda.
export function resolveDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
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
