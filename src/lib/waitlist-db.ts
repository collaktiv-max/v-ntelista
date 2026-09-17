import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WaitlistEntry, WaitlistSubmission } from "./types";

// Enkel fil-baserad "databas" tills projektet kopplas mot en riktig backend.
// Svaren skrivs till en JSON-fil på servern (inte i webbläsarens localStorage)
// så att alla anmälningar samlas på ett ställe, oavsett vem som svarar.
// Notera: på en serverless-driftsättning (t.ex. Vercel) är filsystemet
// skrivskyddat/tillfälligt – kör då `next start` på en vanlig server, eller
// byt ut den här filen mot en riktig databas (t.ex. Postgres) med samma
// funktionssignaturer.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");

async function readAll(): Promise<WaitlistEntry[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as WaitlistEntry[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(entries: WaitlistEntry[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function addWaitlistEntry(
  submission: WaitlistSubmission
): Promise<WaitlistEntry> {
  const entries = await readAll();
  const entry: WaitlistEntry = {
    ...submission,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  await writeAll(entries);
  return entry;
}
