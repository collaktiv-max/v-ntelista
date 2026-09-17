import { NextResponse } from "next/server";
import { addWaitlistEntry } from "@/lib/waitlist-db";
import {
  MER_BUSS_OPTIONS,
  RABATT_OPTIONS,
  type MerBussOption,
  type RabattOption,
} from "@/lib/types";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { busGuess, merBussAnswer, rabattAnswer, email } = (body ?? {}) as Record<
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

  const merBuss =
    typeof merBussAnswer === "string" &&
    (MER_BUSS_OPTIONS as readonly string[]).includes(merBussAnswer)
      ? (merBussAnswer as MerBussOption)
      : null;
  const rabatt =
    typeof rabattAnswer === "string" &&
    (RABATT_OPTIONS as readonly string[]).includes(rabattAnswer)
      ? (rabattAnswer as RabattOption)
      : null;

  if (!merBuss && !rabatt) {
    return NextResponse.json(
      { error: "Svara på minst en av de två frågorna." },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "Ange en giltig e-postadress." },
      { status: 400 }
    );
  }

  const entry = await addWaitlistEntry({
    busGuess: guess,
    merBussAnswer: merBuss,
    rabattAnswer: rabatt,
    email: email.trim().toLowerCase(),
  });

  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
}
