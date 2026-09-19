import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { resolveDatabaseUrl } from "./db-env";

// Adminkontot (e-post, lösenordshash och en slumpad signeringsnyckel för
// inloggningssessionen) sparas i samma databas som väntelistans svar –
// se src/lib/waitlist-db.ts. Det skapas första gången någon fyller i
// "Skapa admin-konto" på /admin/login, direkt från webbläsaren. Inga
// miljövariabler eller Vercel-inställningar behövs för själva
// inloggningen.
export interface AdminConfig {
  email: string;
  passwordHash: string;
  sessionSecret: string;
}

const databaseUrl = resolveDatabaseUrl();

function sql() {
  return neon(databaseUrl!);
}

let tableReady: Promise<void> | null = null;

async function ensureTable() {
  if (!tableReady) {
    tableReady = sql()`
      CREATE TABLE IF NOT EXISTS admin_config (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        session_secret TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      )
    `.then(() => undefined);
  }
  await tableReady;
}

async function getConfigPostgres(): Promise<AdminConfig | null> {
  await ensureTable();
  const rows = (await sql()`
    SELECT email, password_hash, session_secret FROM admin_config WHERE id = 1
  `) as Array<{ email: string; password_hash: string; session_secret: string }>;
  if (rows.length === 0) return null;
  return {
    email: rows[0].email,
    passwordHash: rows[0].password_hash,
    sessionSecret: rows[0].session_secret,
  };
}

async function setConfigPostgres(config: AdminConfig): Promise<void> {
  await ensureTable();
  await sql()`
    INSERT INTO admin_config (id, email, password_hash, session_secret, created_at)
    VALUES (1, ${config.email}, ${config.passwordHash}, ${config.sessionSecret}, ${new Date().toISOString()})
    ON CONFLICT (id) DO UPDATE SET
      email = excluded.email,
      password_hash = excluded.password_hash,
      session_secret = excluded.session_secret
  `;
}

// --- Fallback för lokal utveckling utan databas ---

const DATA_FILE = path.join(process.cwd(), "data", "admin.json");

async function getConfigFile(): Promise<AdminConfig | null> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as AdminConfig;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function setConfigFile(config: AdminConfig): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function getAdminConfig(): Promise<AdminConfig | null> {
  return databaseUrl ? getConfigPostgres() : getConfigFile();
}

export async function setAdminConfig(config: AdminConfig): Promise<void> {
  return databaseUrl ? setConfigPostgres(config) : setConfigFile(config);
}
