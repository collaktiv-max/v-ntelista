import { NextResponse } from "next/server";
import { addWaitlistEntry } from "@/lib/waitlist-db";
import { RABATT_OPTIONS, type RabattOption } from "@/lib/types";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_LOCAL_BUSINESS_LENGTH = 500;

export async function POST(request: Request) {
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

  const entry = await addWaitlistEntry({
    busGuess: guess,
    rabattAnswer: rabatt,
    localBusinessAnswer: localBusiness || null,
    email: email.trim().toLowerCase(),
  });

  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
}
