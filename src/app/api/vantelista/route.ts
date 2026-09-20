import { NextResponse } from "next/server";
import { addWaitlistEntry } from "@/lib/waitlist-db";
import { RABATT_OPTIONS, type RabattOption } from "@/lib/types";
import { getStorageProblem } from "@/lib/db-env";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_LOCAL_BUSINESS_LENGTH = 500;

// Besökare ska aldrig se interna drifttermer (Vercel, Redeploy, etc.) –
// den detaljerade förklaringen loggas åt oss (och syns i /api/admin/debug)
// istället.
const GENERIC_STORAGE_ERROR =
  "Kunde inte spara ditt svar just nu. Försök igen om en liten stund.";

export async function POST(request: Request) {
  const storageProblem = getStorageProblem();
  if (storageProblem) {
    console.error("[vantelista] lagringsproblem:", storageProblem);
    return NextResponse.json({ error: GENERIC_STORAGE_ERROR }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { busGuess, rabattAnswer, localBusinessAnswer, email } = (body ?? {}) as Record<
    string,
    unknown
  >;

  const guess = Number(busGuess);
  if (!Number.isFinite(guess) || guess < 0) {
    return NextResponse.json(
      { error: "Ange en giltig gissning på antalet bussbiljetter." },
      { status: 400 }
    );
  }

  const rabatt =
    typeof rabattAnswer === "string" &&
    (RABATT_OPTIONS as readonly string[]).includes(rabattAnswer)
      ? (rabattAnswer as RabattOption)
      : null;

  if (!rabatt) {
    return NextResponse.json(
      { error: "Svara på frågan om vilka rabatter du vill ha." },
      { status: 400 }
    );
  }

  const localBusiness =
    typeof localBusinessAnswer === "string"
      ? localBusinessAnswer.trim().slice(0, MAX_LOCAL_BUSINESS_LENGTH)
      : "";

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Ange en giltig e-postadress." },
      { status: 400 }
    );
  }

  try {
    const entry = await addWaitlistEntry({
      busGuess: guess,
      rabattAnswer: rabatt,
      localBusinessAnswer: localBusiness || null,
      email: email.trim().toLowerCase(),
    });
    return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
  } catch (err) {
    console.error("[vantelista] kunde inte spara anmälan:", err);
    return NextResponse.json({ error: GENERIC_STORAGE_ERROR }, { status: 500 });
  }
}
