import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { WaitlistEntry, WaitlistSubmission } from "./types";

// Anmälningar sparas i en riktig Postgres-databas (Neon) när projektet är
// kopplat till en databas i Vercel – se README för hur du kopplar in det.
// DATABASE_URL sätts då automatiskt av Vercel.
//
// Saknas DATABASE_URL (t.ex. när du kör `npm run dev` lokalt utan att ha
// kopplat en databas) sparas anmälningarna istället i data/waitlist.json,
// så sidan går att testa direkt utan extra uppsättning.
const databaseUrl = process.env.DATABASE_URL;

let tableReady: Promise<void> | null = null;

function sql() {
  return neon(databaseUrl!);
}

async function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await sql()`
        CREATE TABLE IF NOT EXISTS waitlist_entries (
          id TEXT PRIMARY KEY,
          bus_guess INTEGER NOT NULL,
          rabatt_answer TEXT NOT NULL,
          local_business_answer TEXT,
          email TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL
        )
      `;
      // Säkerställer att kolumnen finns även på en databas som skapades
      // innan den här frågan lades till.
      await sql()`
        ALTER TABLE waitlist_entries
        ADD COLUMN IF NOT EXISTS local_business_answer TEXT
      `;
    })();
  }
  await tableReady;
}

async function addEntryPostgres(
  submission: WaitlistSubmission
): Promise<WaitlistEntry> {
  await ensureTable();
  const entry: WaitlistEntry = {
    ...submission,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await sql()`
    INSERT INTO waitlist_entries (id, bus_guess, rabatt_answer, local_business_answer, email, created_at)
    VALUES (${entry.id}, ${entry.busGuess}, ${entry.rabattAnswer}, ${entry.localBusinessAnswer}, ${entry.email}, ${entry.createdAt})
  `;
  return entry;
}

// --- Fallback för lokal utveckling utan databas ---

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");

async function readAllFromFile(): Promise<WaitlistEntry[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as WaitlistEntry[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function addEntryFile(
  submission: WaitlistSubmission
): Promise<WaitlistEntry> {
  const entries = await readAllFromFile();
  const entry: WaitlistEntry = {
    ...submission,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
  return entry;
}

export async function addWaitlistEntry(
  submission: WaitlistSubmission
): Promise<WaitlistEntry> {
  return databaseUrl ? addEntryPostgres(submission) : addEntryFile(submission);
}
